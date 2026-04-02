/** grid별 최대 빙고 수 (행 + 열 + 대각선(정사각형만)) */
export function calcMaxBingo(cols: number, rows: number): number {
  return cols + rows + (cols === rows ? 2 : 0);
}
