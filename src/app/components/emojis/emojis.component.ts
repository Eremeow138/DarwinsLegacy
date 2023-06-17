import { AfterViewInit, Component, OnInit, TrackByFunction, ViewChild } from "@angular/core";
import { DataService } from "src/app/services/data/data.service";
import { IMenuLink } from "../menu/menu.component";
import { ITableAction, TableCellActions, TableColumn, TableRow } from "../table/table.component";
import { BehaviorSubject, combineLatest, startWith, Subject, switchMap, takeUntil } from "rxjs";
import { MatPaginator } from "@angular/material/paginator";
import { ActivatedRoute } from "@angular/router";
import { EmojiStatusEnum, LocalStorageKeyEnum } from "src/app/models/data";

// Состояние страницы
interface IEmojiPageState {
  // Количество элементов на старнице
  pageSize: number;
  // Индекс страницы
  pageIndex: number;
}

type EmojiPages = Record<EmojiStatusEnum, IEmojiPageState>;

@Component({
  selector: "app-emojis",
  templateUrl: "./emojis.component.html",
  styleUrls: ["./emojis.component.scss"],
})
export class EmojisComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  readonly links: Array<IMenuLink> = [
    { label: "Все", link: `/${EmojiStatusEnum.GENERAL}` },
    { label: "Избранное", link: `/${EmojiStatusEnum.FAVORITE}` },
    { label: "Удаленное", link: `/${EmojiStatusEnum.REMOVED}` },
  ];

  readonly emojiColumns: Array<TableColumn> = [
    {
      name: "name",
      label: "Имя",
      type: "text",
    },
    {
      name: "link",
      label: "Ссылка",
      type: "link",
    },
    {
      name: "preview",
      label: "Превью",
      type: "image",
    },
    {
      name: "actionsList",
      label: "Действия",
      type: "actions",
    },
  ];

  emojiRows: Array<TableRow> = [];

  readonly pageSizeOptions = [10, 20, 30, 40];

  pages: EmojiPages = {
    general: {
      pageSize: this.pageSizeOptions[1],
      pageIndex: 0,
    },
    favorite: {
      pageSize: this.pageSizeOptions[1],
      pageIndex: 0,
    },
    removed: {
      pageSize: this.pageSizeOptions[1],
      pageIndex: 0,
    },
  };

  pageSize = this.pageSizeOptions[1];

  countOfEmojis = 0;

  emojisTrackBy: TrackByFunction<TableRow> = (index: number, row: TableRow) => row["name"].value;

  private reload$ = new BehaviorSubject<null>(null);

  private destroyPaginatorAndReloadSubscribe$ = new Subject<void>();

  constructor(private dataService: DataService, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    const pagesStateFromLocalStorage = localStorage.getItem(LocalStorageKeyEnum.EMOJIS_PAGE_STATE);
    if (pagesStateFromLocalStorage) {
      this.pages = JSON.parse(pagesStateFromLocalStorage);
    } else {
      localStorage.setItem(LocalStorageKeyEnum.EMOJIS_PAGE_STATE, JSON.stringify(this.pages));
    }
  }

  ngAfterViewInit(): void {
    // todo объяснить зачем тут сет таймаут
    setTimeout(() => {
      this.activatedRoute.params.subscribe((params) => {
        // При каждом изменении параметра, уничтожаем подписку на paginator и reload$
        // так как мы подпишемся заново
        this.destroyPaginatorAndReloadSubscribe$.next();

        const currentEmojiStatus = params["status"] as EmojiStatusEnum;
        this.paginator.pageIndex = this.pages[currentEmojiStatus].pageIndex;
        this.paginator.pageSize = this.pages[currentEmojiStatus].pageSize;

        combineLatest([
          this.paginator.page.asObservable().pipe(
            startWith({
              pageIndex: this.paginator.pageIndex,
              pageSize: this.paginator.pageSize,
            })
          ),
          this.reload$,
        ])
          .pipe(
            takeUntil(this.destroyPaginatorAndReloadSubscribe$),
            switchMap(([pageData]) => {
              this.pages[currentEmojiStatus].pageIndex = pageData.pageIndex;
              this.pages[currentEmojiStatus].pageSize = pageData.pageSize;

              this.pageSize = pageData.pageSize;

              localStorage.setItem(LocalStorageKeyEnum.EMOJIS_PAGE_STATE, JSON.stringify(this.pages));

              return this.dataService.getEmojis(pageData.pageSize, pageData.pageIndex + 1, currentEmojiStatus);
            })
          )
          .subscribe({
            next: (emojis) => {
              this.emojiRows = emojis.items.map((emoji) => {
                return {
                  name: { value: emoji.name },
                  link: { value: emoji.imageUrl },
                  preview: { value: emoji.imageUrl },
                  actionsList: { actionsList: this.getActionListByStatus(emoji.status) },
                };
              });
              this.countOfEmojis = emojis.count;
            },
            //todo добавить обработчик ошибок
            error: (error) => {
              console.log(error);
            },
          });
      });
    }, 0);
  }

  getActionListByStatus(status: EmojiStatusEnum): Array<TableCellActions> {
    switch (status) {
      case EmojiStatusEnum.FAVORITE:
        return [
          {
            label: "Удалить",
            action: EmojiStatusEnum.GENERAL,
          },
        ];

      case EmojiStatusEnum.REMOVED:
        return [
          {
            label: "Восстановить",
            action: EmojiStatusEnum.GENERAL,
          },
        ];

      default:
        return [
          {
            label: "В избранное",
            action: EmojiStatusEnum.FAVORITE,
          },
          {
            label: "Удалить",
            action: EmojiStatusEnum.REMOVED,
          },
        ];
    }
  }

  resolveAction(tableAction: ITableAction): void {
    const emojiName = tableAction.tableCell.row["name"].value;
    // todo отписаться
    if (emojiName) {
      this.dataService.changeEmojiStatus(emojiName, tableAction.action as EmojiStatusEnum).subscribe(() => {
        this.reload$.next(null);
      });
    }
  }
}
