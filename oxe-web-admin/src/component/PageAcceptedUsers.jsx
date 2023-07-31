import React from "react";
import "./PageTask.css";
import "react-datepicker/dist/react-datepicker.css";
import { NotificationManager as nm } from "react-notifications";
import DatePicker from "react-datepicker";

import { getRequest, getBlobRequest } from "../utils/request.jsx";
import { dictToURI } from "../utils/url.jsx";
import { dateToString } from "../utils/date.jsx";
import Loading from "./box/Loading.jsx";
import DynamicTable from "./table/DynamicTable.jsx";

export default class PageAcceptedUsers extends React.Component {
	constructor(props) {
		super(props);

		this.fetchUsers = this.fetchUsers.bind(this);
		this.setDateFrom = this.setDateFrom.bind(this);
		this.setDateTo = this.setDateTo.bind(this);

		this.state = {
			pagination: null,
			page: 1,
			per_page: 10,
			requests: null,
			users: null,
			date_from: null,
			date_to: null,
		};
	}

	componentDidMount() {
		this.fetchUsers(1);
	}

	static toDateString(date) {
		const year = date.getFullYear();
		const month = date.getMonth() + 1;
		const day = date.getDate();
		return year + "-" + (month < 10 ? "0" : "") + month + "-" + (day < 10 ? "0" : "") + day;
	}

	fetchUsers(page) {
		const filters = {
			page: Number.isInteger(page) ? page : this.state.page,
			per_page: this.state.per_page,
		};

		if (this.state.date_from !== null) {
			filters.date_from = PageAcceptedUsers.toDateString(this.state.date_from) + " 00:00:00";
		}

		if (this.state.date_to) {
			filters.date_to = PageAcceptedUsers.toDateString(this.state.date_to) + " 23:59:59";
		}

		getRequest.call(this, "user/get_accepted_users?" + dictToURI(filters), (data) => {
			this.setState({
				users: data.items,
				pagination: data.pagination,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	export() {
		const filters = {
			page: this.state.page,
			per_page: this.state.per_page,
		};

		if (this.state.date_from !== null) {
			filters.date_from = PageAcceptedUsers.toDateString(this.state.date_from) + " 00:00:00";
		}

		if (this.state.date_to) {
			filters.date_to = PageAcceptedUsers.toDateString(this.state.date_to) + " 23:59:59";
		}

		getBlobRequest.call(this, "user/get_accepted_users_export?" + dictToURI(filters), (blob) => {
			const url = window.URL.createObjectURL(new Blob([blob]));
			// window.location = url;
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", "Export - Accepted Users "
				+ dateToString(new Date()) + ".csv");
			document.body.appendChild(link);
			link.click();
			link.parentNode.removeChild(link);
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	setDateFrom(date) {
		this.setState({
			users: null,
			page: 1,
			date_from: date,
		}, () => {
			this.fetchUsers();
		});
	}

	setDateTo(date) {
		this.setState({
			users: null,
			page: 1,
			date_to: date,
		}, () => {
			this.fetchUsers();
		});
	}

	refresh() {
		this.setState({
			users: null,
			page: 1,
			date_from: null,
			date_to: null,
		}, () => {
			this.fetchUsers();
		});
	}

	render() {
		const columns = [
			{
				Header: "Date",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					value.submission_date
				),
				width: 200,
			},
			{
				Header: "Email",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					value.email
				),
			},
			{
				Header: "Accept Communication",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					value.accept_communication
				),
			},
			{
				Header: "First Name",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					value.first_name
				),
			},
			{
				Header: "Last Name",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					value.last_name
				),
			},
			{
				Header: "Telephone",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					value.telephone
				),
			},
			{
				Header: "Mobile",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					value.mobile
				),
			},
			{
				Header: "Gender",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					value.gender
				),
			},
			{
				Header: "Domains of Interest",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					value.domains_of_interest
				),
			},
			{
				Header: "Experience",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					value.experience
				),
			},
			{
				Header: "Areas of Expertise",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					value.expertise
				),
			},
			{
				Header: "How Heard About",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					value.how_heard
				),
			},
			{
				Header: "Industry",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					value.industry
				),
			},
			{
				Header: "Nationality",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					value.nationality
				),
			},
			{
				Header: "Profession",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					value.profession
				),
			},
			{
				Header: "Residency",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					value.residency
				),
			},
			{
				Header: "Sector",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					value.sector
				),
			},
			{
				Header: "Public Profile",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					value.public
				),
			},
		];
		return (
			<div id="PageAcceptedUsers" className="max-sized-page fade-in">
				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h1>{this.state.pagination !== null ? this.state.pagination.total : 0} User Request{this.state.pagination !== null && this.state.pagination.total > 1 ? "s" : ""}</h1>
						<div className="row mb-3">
							<div className="col-auto row">
								<div className="col-auto">Date from:</div>
								<div className="col-auto">
									<DatePicker
										selected={this.state.date_from}
										onSelect={this.setDateFrom} />
								</div>
							</div>
							<div className="col-auto row">
								<div className="col-auto">Date to:</div>
								<div className="col-auto">
									<DatePicker
										selected={this.state.date_to}
										onSelect={this.setDateTo} />
								</div>
							</div>
							<div className="col-auto">
								<button onClick={() => this.export()}>
									Export
								</button>
							</div>
						</div>
						<div className="top-right-buttons">
							<button
								onClick={() => this.refresh()}>
								<i className="fas fa-redo-alt" />
							</button>
						</div>
					</div>
					<div className="col-md-12 PageEntity-table">
						{this.state.users !== null
							? <DynamicTable
								columns={columns}
								data={this.state.users}
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
