import { Component, EventEmitter, Input, OnInit, Output, TrackByFunction } from "@angular/core";
import { TooltipPosition } from "../../../tooltip/directives/tooltip.directive";

export type TableColumnType = "text" | "link" | "image" | "actions";

export type TableColumn = {
  // Служебное название колонки, по которому значение будет доставаться из строки.
  name: string;
  // Подпись к колонке, которая отобразится в интерфейсе.
  label: string;
  // Тип колонки.
  type: TableColumnType;
  // Стили для каждой ячейки колонки
  ngCellStyles?: NgStyle;
  // Стили для каждой ячейки заголовка столбца
  ngHeaderCellStyles?: NgStyle;
};

export type TableCellValue = string | null;

export type TableCellAction = {
  action: string;
  tooltip: string;
  // Названия материал иконок https://www.angularjswiki.com/angular/angular-material-icons-list-mat-icon-list/
  iconName: string;
  color?: "basic" | "primary" | "accent" | "warn" | "disabled" | "link";
};

export type NgStyle = Record<string, string | number>;

export type TableRowCell = {
  // текущее значение ячейки
  value?: TableCellValue;
  // Список действий для ячейки с типом "actions".
  actionsList?: Array<TableCellAction>;
  // Стили для директивы ngStyle. Применяются к ребенку ячейки.
  cellContentNgStyle?: NgStyle;
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

  readonly TooltipPosition = TooltipPosition;

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

  getCellContentStyles(row: TableRow, column: TableColumn): NgStyle | null {
    const styles = row[column.name].cellContentNgStyle;
    return styles ? styles : null;
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
