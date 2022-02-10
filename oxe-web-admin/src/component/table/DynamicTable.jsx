import React from "react";
import { useTable, usePagination, useFlexLayout } from "react-table";
import "./Table.css";

export default function Table({
	columns, data, pagination, changePage, height, showBottomBar,
}) {
	const {
		getTableProps,
		getTableBodyProps,
		headerGroups,
		prepareRow,
		page,
		setPageSize,
		state: {
			pageSize,
		},
	} = useTable(
		{
			columns,
			data,
			height,
			showBottomBar,
			initialState: {
				pageIndex: 0,
				pageSize: pagination.per_page,
			},
		},
		usePagination,
		useFlexLayout,
	);

	return (
		<div>
			<table {...getTableProps()}>
				<thead>
					{headerGroups.map((headerGroup, i) => (
						<tr {...headerGroup.getHeaderGroupProps()} key={i}>
							{headerGroup.headers.map((column) => (
								<th {...column.getHeaderProps()} key={i}>{column.render("Header")}</th>
							))}
						</tr>
					))}
				</thead>
				<tbody {...getTableBodyProps()}>
					{page.map((row, i) => {
						prepareRow(row);
						return (
							<tr {...row.getRowProps()} key={i}>
								{row.cells.map((cell) => <td {...cell.getCellProps()} key={i}>
									{cell.render("Cell")}
								</td>)}
							</tr>
						);
					})}
				</tbody>
			</table>
			<div className="Table-pagination">
				<div className="Table-pagination-center">
					<span>
						Page{" "}
						<strong>
							{pagination.page} of {pagination.pages}
						</strong>{" "}
					</span>

					{typeof height === "undefined" && showBottomBar
						? <select
							value={pageSize}
							onChange={(e) => {
								setPageSize(Number(e.target.value));
							}}
						>
							{// eslint-disable-next-line arrow-body-style
							}{[10, 20, 50].map((ps) => {
								return (
									<option key={ps} value={ps}>
										Show {ps}
									</option>
								);
							})}
						</select>
						: ""
					}
				</div>

				<div className="Table-pagination-button-left">
					<button
						onClick={() => changePage(1)}
						disabled={pagination.page <= 1}>
						{"<<"}
					</button>{" "}
					<button
						onClick={() => changePage(pagination.page - 1)}
						disabled={pagination.page <= 1}>
						{"<"}
					</button>{" "}
				</div>

				<div className="Table-pagination-button-right">
					<button
						onClick={() => changePage(pagination.page + 1)}
						disabled={pagination.page >= pagination.pages}>
						{">"}
					</button>{" "}
					<button
						onClick={() => changePage(pagination.pages)}
						disabled={pagination.page >= pagination.pages}>
						{">>"}
					</button>{" "}
				</div>
			</div>
		</div>
	);
}
