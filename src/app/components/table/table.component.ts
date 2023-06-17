import { Component, EventEmitter, Input, OnInit, Output, TrackByFunction } from "@angular/core";

export type TableColumnType = "text" | "link" | "image" | "actions";

export type TableColumn = {
  // Служебное название колонки, по которому значение будет доставаться из строки.
  name: string;

  // Подпись к колонке, которая отобразится в интерфейсе.
  label: string;

  // Тип колонки.
  type: TableColumnType;
};

export type TableCellValue = string | null;

export type TableCellAction = {
  action: string;
  tooltip: string;
  // Названия материал иконок https://www.angularjswiki.com/angular/angular-material-icons-list-mat-icon-list/
  iconName: string;
  color?: "basic" | "primary" | "accent" | "warn" | "disabled" | "link";
};

export type TableRowCell = {
  // текущее значение ячейки
  value?: TableCellValue;
  // Список действий для ячейки с типом "actions".
  actionsList?: Array<TableCellAction>;
};

export type TableRow = {
  [x: string]: TableRowCell;
};

export type TableCell = {
  row: TableRow;
  column: TableColumn;
};

export interface ITableAction {
  tableCell: TableCell;
  action: string;
}

@Component({
  selector: "app-table[trackByFn]",
  templateUrl: "./table.component.html",
  styleUrls: ["./table.component.scss"],
})
export class TableComponent implements OnInit {
  // Пользовательские колонки.
  @Input()
  columns: Array<TableColumn> = [];
  // Табличные строки.
  @Input()
  rows: Array<TableRow> = [];

  @Input()
  trackByFn!: TrackByFunction<TableRow>;

  // Закрепить header при скроллинге.
  @Input()
  isStickyHeader?: boolean = true;

  @Output()
  actionEvent = new EventEmitter<ITableAction>();

  // Массив с именами колонок для удобного использования из разметки.
  columnsNames: Array<string> = [];

  ngOnInit(): void {
    this.columnsNames = this.columns.map((column: TableColumn): string => column.name);
  }

  getTextCellValue(row: TableRow, column: TableColumn): string {
    const columnValue = row[column.name].value;
    return columnValue ? columnValue : "";
  }

  getCellActions(row: TableRow, column: TableColumn): Array<TableCellAction> {
    const actions = row[column.name].actionsList;
    return actions ? actions : [];
  }

  emitAction(column: TableColumn, row: TableRow, action: string): void {
    this.actionEvent.emit({
      tableCell: {
        column,
        row,
      },
      action,
    });
  }
}
