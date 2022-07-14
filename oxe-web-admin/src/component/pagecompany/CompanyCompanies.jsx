import React from "react";
import "./CompanyCompanies.css";
import { NotificationManager as nm } from "react-notifications";
import Popup from "reactjs-popup";
import Loading from "../box/Loading.jsx";
import Table from "../table/Table.jsx";
import { postRequest } from "../../utils/request.jsx";
import Company from "../item/Company.jsx";
import Website from "../item/Website.jsx";
import FormLine from "../button/FormLine.jsx";
import DialogCompanyFilter from "../dialog/DialogCompanyFilter.jsx";

export default class CompanyCompanies extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			newCompanyName: null,
		};
	}

	addCompany() {
		const params = {
			name: this.state.newCompanyName,
		};

		postRequest.call(this, "company/add_company", params, () => {
			this.props.refreshCompanies();
			this.setState({ newCompanyName: null });
			nm.info("The entity has been added");
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
				Header: "Name",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<Company
						id={value.id}
						name={value.name}
						afterDeletion={() => this.props.refreshCompanies()}
						onOpen={() => this.props.history.push("/companies/" + value.id)}
						onClose={() => this.props.history.push("/companies")}
						open={value.id.toString() === this.props.match.params.id}
					/>
				),
			},
			{
				Header: "Trade register number",
				accessor: "trade_register_number",
			},
			{
				Header: "Website",
				accessor: "website",
				Cell: ({ cell: { value } }) => (
					<Website
						url={value}
					/>
				),
			},
		];

		return (
			<div id="CompanyCompanies">
				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h1>
							{this.props.companies ? this.props.companies.length : 0}
							&nbsp;Entit{this.props.companies && this.props.companies.length > 1 ? "ies" : "y"}
						</h1>
						<div className="top-right-buttons">
							<button
								onClick={() => this.props.refreshCompanies()}>
								<i className="fas fa-redo-alt"/>
							</button>
							<Popup
								trigger={
									<button>
										<i className="fas fa-plus"/>
									</button>
								}
								modal
							>
								{(close) => <div className={"row row-spaced"}>
									<div className={"col-md-9"}>
										<h2>Add a new entity</h2>
									</div>

									<div className={"col-md-3"}>
										<div className="top-right-buttons">
											<button
												className={"grey-background"}
												data-hover="Close"
												data-active=""
												onClick={close}>
												<span><i className="far fa-times-circle"/></span>
											</button>
										</div>
									</div>

									<div className="col-md-12">
										<FormLine
											label={"Article title"}
											value={this.state.newCompanyName}
											onChange={(v) => this.changeState("newCompanyName", v)}
										/>
										<div className="right-buttons">
											<button
												onClick={() => this.addCompany()}
												disabled={this.state.newCompanyName === null
													|| this.state.newCompanyName.length < 3}>
												<i className="fas fa-plus"/> Add a new entity
											</button>
										</div>
									</div>
								</div>}
							</Popup>
							<DialogCompanyFilter
								trigger={
									<button
										className={"blue-background"}
										data-hover="Filter">
										<i className="fas fa-search"/>
									</button>
								}
								filters={this.props.filters}
								applyFilter={(filters) => this.props.applyFilter(filters)}
							/>
						</div>
					</div>
					<div className="col-md-12 CompanyCompanies-table">
						{this.props.companies
							? <Table
								columns={columns}
								data={this.props.companies
									.filter((c) => this.props.match.params.id === undefined
										|| this.props.match.params.id === c.id.toString())}
								showBottomBar={true}
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
