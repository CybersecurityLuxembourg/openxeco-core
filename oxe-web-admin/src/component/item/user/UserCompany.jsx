import React from "react";
import "./UserCompany.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import Loading from "../../box/Loading.jsx";
import { getRequest, postRequest } from "../../../utils/request.jsx";
import FormLine from "../../button/FormLine.jsx";
import DialogConfirmation from "../../dialog/DialogConfirmation.jsx";

export default class UserCompany extends React.Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);
		this.getAllCompanies = this.getAllCompanies.bind(this);
		this.addUserCompany = this.addUserCompany.bind(this);
		this.deleteUserCompany = this.deleteUserCompany.bind(this);

		this.state = {
			userCompanies: null,
			selectedCompany: null,
			allCompanies: null,
			userCompaniesEnums: null,
		};
	}

	componentDidMount() {
		this.refresh();
		this.getAllCompanies();
	}

	refresh() {
		getRequest.call(this, "user/get_user_company_enums", (data) => {
			this.setState({
				userCompaniesEnums: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "user/get_user_companies/" + this.props.id, (data) => {
			this.setState({
				userCompanies: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getAllCompanies() {
		getRequest.call(this, "company/get_companies", (data) => {
			this.setState({
				allCompanies: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	addUserCompany(close) {
		const params = {
			user: this.props.id,
			company: this.state.selectedCompany,
		};

		postRequest.call(this, "user/add_user_company", params, () => {
			this.refresh();
			nm.info("The entity has been added to the user");
			close();
		}, (response) => {
			this.refresh();
			nm.warning(response.statusText);
		}, (error) => {
			this.refresh();
			nm.error(error.message);
		});
	}

	deleteUserCompany(id) {
		const params = {
			user: this.props.id,
			company: id,
		};

		postRequest.call(this, "user/delete_user_company", params, () => {
			this.refresh();
			nm.info("The row has been deleted");
		}, (response) => {
			this.refresh();
			nm.warning(response.statusText);
		}, (error) => {
			this.refresh();
			nm.error(error.message);
		});
	}

	updateUserCompany(company, department) {
		const params = {
			user: this.props.id,
			company,
			department,
		};

		postRequest.call(this, "user/update_user_company", params, () => {
			this.refresh();
			nm.info("The assignment has been updated");
		}, (response) => {
			this.refresh();
			nm.warning(response.statusText);
		}, (error) => {
			this.refresh();
			nm.error(error.message);
		});
	}

	getCompanyFromId(companyId) {
		if (this.state.allCompanies) {
			const filteredCompanies = this.state.allCompanies.filter((c) => c.id === companyId);

			if (filteredCompanies.length > 0) {
				return filteredCompanies[0];
			}
			return null;
		}

		return null;
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<div className={"row"}>
				<div className="col-md-12">
					<div className={"top-right-buttons"}>
						<Popup
							className="Popup-small-size"
							trigger={
								<button
									className={"blue-background"}>
									<i className="fas fa-plus"/> Add an entity
								</button>
							}
							modal
							closeOnDocumentClick
						>
							{(close) => <div className="row row-spaced">
								<div className="col-md-12">
									<h2>Add an assignment to an entity</h2>

									<div className={"top-right-buttons"}>
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
									{this.state.allCompanies !== null
										? <div>
											<FormLine
												label={"Company"}
												type={"select"}
												value={this.state.selectedCompany}
												options={this.state.allCompanies === null ? []
													: [{ value: null, label: "-" }].concat(
														this.state.allCompanies.map((c) => ({ label: c.name, value: c.id })),
													)}
												onChange={(v) => this.setState({ selectedCompany: v })}
											/>
											<div className="right-buttons">
												<button
													onClick={() => this.addUserCompany(close)}
													disabled={this.state.selectedCompany === null}>
													Add the assignment
												</button>
											</div>
										</div>
										: <Loading
											height={150}
										/>
									}
								</div>
							</div>}
						</Popup>
					</div>

					<h2>Assigned entities</h2>
				</div>

				<div className="col-md-12">
					{this.state.userCompanies
						? (this.state.userCompanies.map((c) => (
							<div className={"row-spaced"} key={c.company_id}>
								<h4>
									{this.getCompanyFromId(c.company_id)
										? this.getCompanyFromId(c.company_id).name
										: "Name not found"
									}
								</h4>

								<FormLine
									label={"Department"}
									type={"select"}
									options={this.state.userCompaniesEnums
										? this.state.userCompaniesEnums.department
											.map((d) => ({ label: d, value: d }))
										: []
									}
									value={c.department} // TODO
									onChange={(v) => this.updateUserCompany(c.company_id, v)}
								/>

								<DialogConfirmation
									text={"Are you sure you want to delete this row?"}
									trigger={
										<button
											className={"red-background Table-right-button"}>
											<i className="fas fa-trash-alt"/> Remove the assignment
										</button>
									}
									afterConfirmation={() => this.deleteUserCompany(c.company_id)}
								/>

							</div>
						)))
						: <Loading
							height={200}
						/>
					}
				</div>
			</div>
		);
	}
}
