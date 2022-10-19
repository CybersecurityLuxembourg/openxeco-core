import React from "react";
import "./PageTask.css";
import { NotificationManager as nm } from "react-notifications";
// import TaskRequest from "./pagetask/TaskRequest.jsx";
// import TaskDataControl from "./pagetask/TaskDataControl.jsx";
// import TaskArticle from "./pagetask/TaskArticle.jsx";
// import Tab from "./tab/Tab.jsx";
import { getRequest } from "../utils/request.jsx";
import { dictToURI } from "../utils/url.jsx";
import Loading from "./box/Loading.jsx";
import DynamicTable from "./table/DynamicTable.jsx";
// import { getUrlParameter } from "../utils/url.jsx";
// import { getSettingValue } from "../utils/setting.jsx";

export default class PageAuditLogs extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			pagination: null,
			page: 1,
			per_page: 20,
			logs: null,
		};
	}

	componentDidMount() {
		this.fetchLogs(1);
	}

	fetchLogs(page) {
		this.setState({
			logs: null,
		});

		const params = {
			page: Number.isInteger(page) ? page : this.state.page,
			per_page: this.state.per_page,
		};

		getRequest.call(this, "audit/get_audit_logs?" + dictToURI(params), (data) => {
			this.setState({
				logs: data.items,
				pagination: data.pagination,
				page,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	refresh() {
		this.setState({
			logs: null,
			page: 1,
		}, () => {
			this.fetchLogs();
		});
	}

	render() {
		const columns = [
			{
				Header: "Timestamp",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					value.timestamp
				),
				width: 60,
			},
			{
				Header: "User ID",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					value.user_id
				),
				width: 20,
			},
			{
				Header: "Type",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					value.entity_type
				),
				width: 20,
			},
			{
				Header: "Action",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					value.action
				),
				width: 40,
			},
			{
				Header: "Values Before",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					value.values_before
				),
				width: 50,
			},
			{
				Header: "Values After",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					value.values_after
				),
				width: 50,
			},

		];
		return (
			<div id="PageAuditLogs" className="max-sized-page fade-in">
				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h1>{this.state.pagination !== null ? this.state.pagination.total : 0} Audit Log{this.state.pagination !== null && this.state.pagination.total > 1 ? "s" : ""}</h1>
						<div className="top-right-buttons">
							<button
								onClick={() => this.refresh()}>
								<i className="fas fa-redo-alt" />
							</button>
						</div>
					</div>
					<div className="col-md-12 PageEntity-table">
						{this.state.logs !== null
							? <DynamicTable
								columns={columns}
								data={this.state.logs}
								pagination={this.state.pagination}
								changePage={this.fetchUsers}
							/>
							: <Loading
								height={500}
							/>
						}
					</div>
				</div>
			</div>
		);
	}
}
