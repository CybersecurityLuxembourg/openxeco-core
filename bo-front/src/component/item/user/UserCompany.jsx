import React from "react";
import "./UserCompany.css";
import { NotificationManager as nm } from "react-notifications";
import Loading from "../../box/Loading.jsx";
import { getRequest, postRequest } from "../../../utils/request.jsx";
import FormLine from "../../button/FormLine.jsx";
/* import Table from "../../table/Table.jsx"; */
import DialogConfirmation from "../../dialog/DialogConfirmation.jsx";

export default class UserCompany extends React.Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);
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

	addUserCompany() {
		const params = {
			user: this.props.id,
			company: this.state.selectedCompany,
		};

		postRequest.call(this, "user/add_user_company", params, () => {
			this.refresh();
			nm.info("The entity has been added to the user");
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
		/* const columns = [
			{
				Header: "Name",
				accessor: "name",
			},
			{
				Header: "Department",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<FormLine
						labelWidth={1}
						label={null}
						type={"select"}
						options={this.state.userCompaniesEnums
							? this.state.userCompaniesEnums.department
								.map((c) => ({ label: c.name, value: c.name }))
							: []
						}
						value={value.department}
						onChange={(v) => this.updateUserCompany(value.id, v)}
					/>
				),
			},
			{
				Header: " ",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<DialogConfirmation
						text={"Are you sure you want to delete this row?"}
						trigger={
							<button
								className={"small-button red-background Table-right-button"}>
								<i className="fas fa-trash-alt"/>
							</button>
						}
						afterConfirmation={() => this.deleteUserCompany(value.id)}
					/>
				),
				width: 50,
			},
		]; */

		return (
			<div className={"row"}>
				<div className="col-md-12">
					<h2>Assigned entities</h2>
				</div>

				{/* <div className="col-md-12">
					{this.state.companies !== null
						? <Table
							columns={columns}
							data={this.state.companies}
						/>
						: <Loading/>
					}
				</div> */}

				<div className="col-md-12">
					{this.state.userCompanies
						? (this.state.userCompanies.map((c) => (
							<div key={c.company_id}>
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
						: <Loading/>
					}
				</div>

				<div className="col-md-12">
					<h2>Add an assignment to an entity</h2>
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
									onClick={this.addUserCompany}
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
			</div>
		);
	}
}
