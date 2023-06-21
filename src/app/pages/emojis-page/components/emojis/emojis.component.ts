import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  TrackByFunction,
  ViewChild,
} from "@angular/core";
import { DataService } from "src/app/services/data/data.service";
import { IMenuLink } from "../../../../common/ui/menu/components/menu/menu.component";
import {
  ITableAction,
  NgStyle,
  TableCellAction,
  TableColumn,
  TableRow,
} from "../../../../common/ui/table/components/table/table.component";
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  startWith,
  Subject,
  switchMap,
  takeUntil,
} from "rxjs";
import { MatPaginator } from "@angular/material/paginator";
import { ActivatedRoute } from "@angular/router";
import { EmojiStatusEnum, EMOJI_STATUS_PARAM, LocalStorageKeyEnum } from "src/app/pages/emojis-page/models/emojis";
import { FormControl } from "@angular/forms";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";

// Состояние страницы
interface IEmojiPageState {
  // Количество элементов на старнице
  pageSize: number;
  // Индекс страницы
  pageIndex: number;
  // Поисковая строка
  searchText: string | null;
}

type EmojiPages = Record<EmojiStatusEnum, IEmojiPageState>;

/**
 * Компонент страницы эмодзи.
 * Компонент делает запросы к эмодзи каждый раз когда меняется параметр страницы.
 */

@UntilDestroy()
@Component({
  selector: "app-emojis",
  templateUrl: "./emojis.component.html",
  styleUrls: ["./emojis.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmojisComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  searchControl = new FormControl("");

  // Для навигации по страницам в качестве адресов (а точнее параметров) используется EmojiStatusEnum
  // Так как в зависимоти от адреса, мы будем получать эмодзи с определенными статусами,
  readonly links: Array<IMenuLink> = [
    { label: "Все", link: `../${EmojiStatusEnum.GENERAL}` },
    { label: "Избранное", link: `../${EmojiStatusEnum.FAVORITE}` },
    { label: "Удаленное", link: `../${EmojiStatusEnum.REMOVED}` },
  ];

  readonly emojiColumns: Array<TableColumn> = [
    {
      name: "name",
      label: "Имя",
      type: "text",
      ngCellStyles: { width: "20%" },
    },
    {
      name: "link",
      label: "Ссылка",
      type: "link",
      ngCellStyles: { width: "50%" },
    },
    {
      name: "preview",
      label: "Превью",
      type: "image",
      ngCellStyles: { width: "15%" },
    },
    {
      name: "actionsList",
      label: "Действия",
      type: "actions",
      ngCellStyles: { width: "15%" },
      ngHeaderCellStyles: { width: "15%", paddingLeft: "30px" },
    },
  ];

  emojiRows: Array<TableRow> = [];

  readonly pageSizeOptions = [10, 20, 30, 40];

  pages: EmojiPages = {
    general: {
      pageSize: this.pageSizeOptions[1],
      pageIndex: 0,
      searchText: "",
    },
    favorite: {
      pageSize: this.pageSizeOptions[1],
      pageIndex: 0,
      searchText: "",
    },
    removed: {
      pageSize: this.pageSizeOptions[1],
      pageIndex: 0,
      searchText: "",
    },
  };

  pageSize = this.pageSizeOptions[1];

  countOfEmojis = 0;

  currentPageStatus = EmojiStatusEnum.GENERAL;

  emojisTrackBy: TrackByFunction<TableRow> = (index: number, row: TableRow) => row["name"].value;

  // Сабджект для получения новых данных
  private reload$ = new BehaviorSubject<null>(null);

  // Сабджект для отписки после изменения параметра страницы
  private unsubscribeAfterParamChanged$ = new Subject<void>();

  constructor(
    private dataService: DataService,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // При инициализации компонента достаем из локального хранилища состояния страниц.
    const pagesStateFromLocalStorage = localStorage.getItem(LocalStorageKeyEnum.EMOJIS_PAGE_STATE);
    if (pagesStateFromLocalStorage) {
      this.pages = JSON.parse(pagesStateFromLocalStorage);
    } else {
      // Если в локальном хранилище состояний страниц нет, записываем в хранилище начальные значения
      localStorage.setItem(LocalStorageKeyEnum.EMOJIS_PAGE_STATE, JSON.stringify(this.pages));
    }
  }

  ngAfterViewInit(): void {
    // Используем setTimeout, чтобы перенести изменение в следующий цикл обнаружения изменений, чтобы избежать ошибки "ExpressionChangedAfterItHasBeenCheckedError"
    setTimeout(() => {
      this.activatedRoute.params.pipe(untilDestroyed(this)).subscribe((params) => {
        // При каждом изменении параметра роута, уничтожаем подписку на paginator и reload$
        this.unsubscribeAfterParamChanged$.next();

        // Записываем текущий статус страницы из параметра роута
        this.currentPageStatus = params[EMOJI_STATUS_PARAM] as EmojiStatusEnum;
        // Устанавливаем пагинатору индекс и размер страницы
        this.paginator.pageIndex = this.pages[this.currentPageStatus].pageIndex;
        this.paginator.pageSize = this.pages[this.currentPageStatus].pageSize;
        // В строку поиска записываем текст для поиска
        this.searchControl.patchValue(this.pages[this.currentPageStatus].searchText);

        // При изменении строки поиска, устанавливаем пагинатору первую страницу
        this.searchControl.valueChanges
          .pipe(
            debounceTime(300),
            distinctUntilChanged(),
            takeUntil(this.unsubscribeAfterParamChanged$),
            untilDestroyed(this)
          )
          .subscribe(() => {
            if (this.paginator.hasPreviousPage()) {
              this.paginator.firstPage();
            } else {
              // Если мы уже на первой странице, запрашиваем новые данные
              this.reload$.next(null);
            }
          });

        // Подписываемся на последние изменения пагинатора и обзервабла перезагрузки
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
            switchMap(([pageData]) => {
              this.pages[this.currentPageStatus].pageIndex = pageData.pageIndex;
              this.pages[this.currentPageStatus].pageSize = pageData.pageSize;
              this.pages[this.currentPageStatus].searchText = this.searchControl.value;

              this.pageSize = pageData.pageSize;

              localStorage.setItem(LocalStorageKeyEnum.EMOJIS_PAGE_STATE, JSON.stringify(this.pages));

              return this.dataService.getEmojisDataForPage(
                pageData.pageSize,
                pageData.pageIndex + 1,
                this.currentPageStatus,
                this.searchControl.value
              );
            }),
            takeUntil(this.unsubscribeAfterParamChanged$),
            untilDestroyed(this)
          )
          .subscribe({
            next: (emojis) => {
              this.emojiRows = emojis.items.map((emoji) => {
                return {
                  name: { value: emoji.name },
                  link: { value: emoji.imageUrl },
                  preview: { value: emoji.imageUrl, cellContentNgStyle: this.getStylesByEmojiStatus(emoji.status) },
                  actionsList: { actionsList: this.getActionListByEmojiStatusAndPageParam(emoji.status) },
                };
              });
              this.countOfEmojis = emojis.count;

              this.cdr.markForCheck();
            },
            error: (error) => {
              console.log(error);
            },
          });
      });
    }, 0);
  }

  /**
   * Получить объекты стилей исходя из статуса эмодзи
   * @param status - статус эмодзи
   */
  private getStylesByEmojiStatus(emojiStatus: EmojiStatusEnum): NgStyle | undefined {
    if (emojiStatus === EmojiStatusEnum.FAVORITE) {
      return { filter: "brightness(110%)" };
    }
    return;
  }

  /**
   * Получить список действий исходя из статуса эмодзи и
   * @param status - статус эмодзи
   */
  private getActionListByEmojiStatusAndPageParam(emojiStatus: EmojiStatusEnum): Array<TableCellAction> {
    const removeFromFavoriteAction: TableCellAction = {
      tooltip: "Удалить из избранного",
      iconName: "favorite",
      color: "accent",
      action: EmojiStatusEnum.GENERAL,
    };

    switch (emojiStatus) {
      case EmojiStatusEnum.FAVORITE:
        // В случае с избранным эмодзи, необходимо также проверить на какой странице мы находимся,
        // так как страница "Все" может содержать избранные эмодзи
        switch (this.currentPageStatus) {
          // Для страницы "Избранное", возвращаем только действие "Удалить из избранного".
          case EmojiStatusEnum.FAVORITE:
            return [removeFromFavoriteAction];
          // Для страницы "Все", возвращаем действия "Удалить из избранного" и "Удалить"
          case EmojiStatusEnum.GENERAL:
            return [
              removeFromFavoriteAction,
              {
                tooltip: "Удалить",
                iconName: "clear",
                action: EmojiStatusEnum.REMOVED,
              },
            ];

          default:
            return [];
        }

      case EmojiStatusEnum.REMOVED:
        return [
          {
            tooltip: "Восстановить",
            iconName: "settings_backup_restore",
            action: EmojiStatusEnum.GENERAL,
            color: "primary",
          },
        ];

      case EmojiStatusEnum.GENERAL:
        return [
          {
            tooltip: "В избранное",
            iconName: "favorite_border",
            action: EmojiStatusEnum.FAVORITE,
            color: "accent",
          },
          {
            tooltip: "Удалить",
            iconName: "clear",
            action: EmojiStatusEnum.REMOVED,
          },
        ];
      default:
        return [];
    }
  }

  resolveAction(tableAction: ITableAction): void {
    const emojiName = tableAction.tableCell.row["name"].value;
    if (emojiName) {
      this.dataService
        .changeEmojiStatus(emojiName, tableAction.action as EmojiStatusEnum)
        .pipe(untilDestroyed(this))
        .subscribe(() => {
          this.reload$.next(null);
        });
    }
  }

  getPageNameByStatus(): string {
    return this.links.find((menuLink) => menuLink.link.includes(this.currentPageStatus))?.label ?? "";
  }
}
