import React from "react";
import "./TaskDataControl.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, postRequest } from "../../utils/request.jsx";
import Message from "../box/Message.jsx";
import Loading from "../box/Loading.jsx";
import Info from "../box/Info.jsx";
import DynamicTable from "../table/DynamicTable.jsx";
import Company from "../item/Company.jsx";
import Article from "../item/Article.jsx";
import FormLine from "../button/FormLine.jsx";
import { dictToURI } from "../../utils/url.jsx";

export default class TaskDataControl extends React.Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);
		this.fetchDataControls = this.fetchDataControls.bind(this);

		this.state = {
			dataControls: null,
			pagination: null,
			search: "",
			page: 1,
		};
	}

	componentDidMount() {
		this.refresh();
	}

	refresh() {
		this.setState({
			dataControls: null,
			page: 1,
		}, () => {
			this.fetchDataControls();
		});
	}

	fetchDataControls(page) {
		const filters = {
			search: this.state.search,
			page: Number.isInteger(page) ? page : this.state.page,
			per_page: 10,
		};

		getRequest.call(this, "datacontrol/get_data_controls?" + dictToURI(filters), (data) => {
			this.setState({
				dataControls: data.items,
				pagination: data.pagination,
				page,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	deleteDataControl(id) {
		const param = {
			id,
		};

		postRequest.call(this, "datacontrol/delete_data_control", param, () => {
			this.fetchDataControls();
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		const columns = [
			{
				Header: "Category",
				accessor: "category",
				width: 60,
			},
			{
				Header: "Value",
				accessor: "value",
			},
			{
				Header: "Object",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<div>
						{value.value.match(/<COMPANY:\d+>/g) !== null
							&& value.value.match(/<COMPANY:\d+>/g).map((r) => <Company
								key={value.id}
								id={parseInt(r.match(/\d+/g)[0], 10)}
							/>)}
						{value.value.match(/<ARTICLE:\d+>/g) !== null
							&& value.value.match(/<ARTICLE:\d+>/g).map((r) => <Article
								key={value.id}
								id={parseInt(r.match(/\d+/g)[0], 10)}
							/>)}
					</div>
				),
				width: 20,
			},
			{
				Header: " ",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<button
						className={"small-button red-background Table-right-button"}
						onClick={() => this.deleteDataControl(value.id)}>
						<i className="fas fa-trash-alt"/>
					</button>
				),
				width: 20,
			},
		];

		return (
			<div id="TaskDataControl" className="max-sized-page fade-in">
				<div className={"row"}>
					<div className="col-md-12">
						<h1>Data control</h1>
						<div className="top-right-buttons">
							<button
								onClick={() => this.refresh()}>
								<i className="fas fa-redo-alt"/>
							</button>
						</div>
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<FormLine
							label={"Filter"}
							value={this.state.search}
							onChange={(v) => this.changeState("search", v)}
							disabled={this.state.dataControls === null}
						/>
					</div>
					<div className="col-md-12">
						<div className="right-buttons">
							<button
								onClick={this.refresh}>
								Apply filter
							</button>
						</div>
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-12">
						{this.state.dataControls === null
							&& <Loading
								height={250}
							/>}

						{this.state.dataControls !== null
							&& this.state.dataControls.length > 0
							&& <div className="fade-in">
								<DynamicTable
									columns={columns}
									data={this.state.dataControls}
									pagination={this.state.pagination}
									changePage={this.fetchDataControls}
								/>
							</div>}

						{this.state.dataControls !== null
							&& this.state.dataControls.length === 0
							&& <Message
								text="Nothing found in the database"
								height={250}
							/>}
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<Info
							content={
								"You can launch again the scanning with the 'SCHEDULED TASK' section of the 'SETTINGS' page"
								+ "<ul/>"
								+ "<li>'/cron/run_database_compliance' issues the 'DATABASE COMPLIANCE' category controls</li>"
								+ "<li>'/cron/run_company_website_check' issues the 'WEBSITE CHECK' category controls</li>"
								+ "</ul>"
							}
						/>
					</div>

					<div className="col-md-12">
						<Info
							content={
								"Checks from '/cron/run_database_compliance' for the entities:"
								+ "<ul/>"
								+ "<li>Check if image, website, creation date are not empty</li>"
								+ "<li>Check if there is at least one physical address</li>"
								+ "<li>Check if there is at least one phone number contact</li>"
								+ "<li>Check if there is an ENTITY TYPE from the taxonomy</li>"
								+ "<li>Check if there is at least one SERVICE GROUP from the ACTORs</li>"
								+ "</ul>"
								+ "Checks from '/cron/run_database_compliance' for the news:"
								+ "<ul/>"
								+ "<li>Check if title, handle and publication date are not empty</li>"
								+ "<li>Check if it has a main version</li>"
								+ "</ul>"
							}
						/>
					</div>
				</div>
			</div>
		);
	}
}
