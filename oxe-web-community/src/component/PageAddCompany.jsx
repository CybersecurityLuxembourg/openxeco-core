import React from "react";
import "./PageAddCompany.css";
import { NotificationManager as nm } from "react-notifications";
import Popup from "reactjs-popup";
import Loading from "./box/Loading.jsx";
import { getRequest, postRequest } from "../utils/request.jsx";
import FormLine from "./form/FormLine.jsx";
import Info from "./box/Info.jsx";
import Message from "./box/Message.jsx";
import DialogConfirmation from "./dialog/DialogConfirmation.jsx";
import DialogHint from "./dialog/DialogHint.jsx";

export default class PageAddCompany extends React.Component {
	constructor(props) {
		super(props);

		this.refreshCompanies = this.refreshCompanies.bind(this);
		this.submitCreationRequest = this.submitCreationRequest.bind(this);
		this.submitClaimRequest = this.submitClaimRequest.bind(this);

		this.state = {
			companies: null,
			filteredCompanies: null,
			newCompanyForm: {},
			searchField: null,
			notFoundEntity: false,
			userCompaniesEnums: null,

			fields: {
				name: "Name",
				type: "Type",
				description: "Description",
				trade_register_number: "Trade register number",
				website: "Website",
				creation_date: "Creation date",
				is_cybersecurity_core_business: "Is cybersecurity core business",
				is_startup: "Is startup",
			},
		};
	}

	componentDidMount() {
		this.refreshCompanies();
		this.getUserCompanyEnums();
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevState.searchField !== this.state.searchField) {
			this.filterCompanies();
		}
	}

	refreshCompanies() {
		getRequest.call(this, "public/get_public_companies", (data) => {
			this.setState({
				companies: data,
			});
		}, (response) => {
			this.setState({ loading: false });
			nm.warning(response.statusText);
		}, (error) => {
			this.setState({ loading: false });
			nm.error(error.message);
		});
	}

	getUserCompanyEnums() {
		getRequest.call(this, "user/get_user_company_enums", (data) => {
			this.setState({
				userCompaniesEnums: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	submitCreationRequest() {
		const params = {
			type: "ENTITY ADD",
			request: "The user requests the creation of an entity",
			data: this.state.newCompanyForm,
		};

		postRequest.call(this, "private/add_request", params, () => {
			this.props.getNotifications();
			nm.info("The request has been sent and will be reviewed");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	submitClaimRequest(companyId) {
		const params = {
			type: "ENTITY ACCESS CLAIM",
			request: "The user requests access to an entity",
			data: {
				company_id: companyId,
				department: this.state.department,
			},
		};

		postRequest.call(this, "private/add_request", params, () => {
			this.props.getNotifications();
			nm.info("The request has been sent and will be reviewed");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	filterCompanies() {
		if (this.state.searchField === null || this.state.searchField.length < 2) {
			this.setState({ filteredCompanies: null });
		} else {
			this.setState({
				filteredCompanies: this.state.companies
					.filter((c) => c.name.toLowerCase().includes(this.state.searchField.toLowerCase())),
			});
		}
	}

	updateNewCompany(field, value) {
		const c = JSON.parse(JSON.stringify(this.state.newCompanyForm));
		c[field] = value;
		this.setState({ newCompanyForm: c });
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	static isFieldCompleted(v) {
		return v !== undefined && v.length > 0;
	}

	render() {
		return (
			<div id="PageAddCompany" className="page max-sized-page row-spaced">
				<div className={"row"}>
					<div className="col-md-12">
						<h1>Add or request access to an entity</h1>
					</div>
				</div>

				{this.state.companies === null
					? <Loading
						height={200}
					/>
					: <div className={"row row-spaced"}>
						<div className="col-md-9">
							<h2>Claim access to an entity</h2>
						</div>

						<div className="col-md-3 top-title-menu">
							<DialogHint
								content={
									<div className="row">
										<div className="col-md-12">
											<h2>Why claiming access to an entity?</h2>

											<p>
												If assigned to an entity, you can request
												a change to its global information,
												logo, addresses and taxonomy.
											</p>

											<p>
												Administrators can contact you to verify
												that you can be legitimately assigned to the entity.
											</p>

											<h2>How to claim access to an entity?</h2>

											<p>
												Type the company name in the text field shown below.
												You need to type at least 2 characters to perform the search.
											</p>

											<img src="/img/hint-search-claim-company.png"/>

											<p>
												Then, you will see the list of entities matching
												your search. By clicking on the &quot;Claim access&quot;
												button, you have claimed the assignment to the chosen entity.
											</p>

											<img src="/img/hint-company-claim-button.png"/>

											<p>
												This will send a request to the administration team,
												who will either accept or reject your request.
											</p>

											<h2>Note</h2>

											<p>
												You can follow up your requests by clicking on
												the icon in the left menu bar as shown below:
											</p>

											<img src="/img/hint-contact-menu.png"/>
										</div>
									</div>
								}
							/>
						</div>

						<div className="col-md-12 row-spaced">
							<FormLine
								label={"Type at least 2 characters to find your entity"}
								value={this.state.newCompanyForm.searchField}
								onChange={(v) => this.changeState("searchField", v)}
							/>
						</div>

						<div className="col-md-12 row-spaced">
							{this.state.filteredCompanies === null
								&& <Message
									text={"Search amongst " + this.state.companies.length + " entities"}
									height={150}
								/>
							}

							{this.state.filteredCompanies !== null
								&& this.state.filteredCompanies.length === 0
								&& <Message
									text={"No entity found"}
									height={150}
								/>
							}

							<div className={"row"}>
								{this.state.filteredCompanies !== null
									&& this.state.filteredCompanies.length > 0
									&& this.state.filteredCompanies.map((c) => <div
										className="col-md-3"
										key={c.id}>
										<div className="card">
											<i className="fas fa-building card-icon"/>
											<div className="card-body">
												<div className="card-title">{c.name}</div>

												<Popup
													className="Popup-small-size"
													trigger={
														<button className={"card-button"}>
															Claim access...
														</button>
													}
													modal
													closeOnDocumentClick
												>
													{(close) => (
														<div className="row">
															<div className="col-md-9 row-spaced">
																<h3>Select your department in the entity</h3>
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
																{this.state.userCompaniesEnums
																	? <FormLine
																		label={"Department"}
																		type={"select"}
																		options={this.state.userCompaniesEnums
																			? this.state.userCompaniesEnums.department
																				.map((d) => ({ label: d, value: d }))
																			: []
																		}
																		value={this.props.department}
																		onChange={(v) => this.setState({ department: v })}
																	/>
																	: <Loading
																		height={200}
																	/>
																}
															</div>

															<div className="col-md-12">
																<div className="right-buttons">
																	<DialogConfirmation
																		text={"Do you want to request access to: " + c.name + "?"}
																		trigger={
																			<button
																				className={"blue-background card-button"}
																			>
																				Claim access...
																			</button>
																		}
																		afterConfirmation={() => this.submitClaimRequest(c.id)}
																	/>
																</div>
															</div>
														</div>
													)}
												</Popup>
											</div>
										</div>
									</div>)
								}
							</div>
						</div>

						<div className="col-md-9">
							<h2>Register a new entity</h2>
						</div>

						<div className="col-md-3 top-title-menu">
							<DialogHint
								content={
									<div className="row">
										<div className="col-md-12">
											<h2>How to register a new entity?</h2>

											<p>
												Fill in the form and select the
												&quot;Request registration&quot; button.
											</p>

											<img src="/img/hint-request-registration-button.png"/>

											<p>
												Note that the Name, Website and Creation date fields
												are mandatory to complete the form.
											</p>

											<h2>Note</h2>

											<p>
												You can follow up your requests by clicking on the
												icon in the left menu bar as shown below:
											</p>

											<img src="/img/hint-contact-menu.png"/>
										</div>
									</div>
								}
							/>
						</div>

						<div className="col-md-12 row-spaced">
							<Info
								content={
									<div>
										You can register your company here.
										Please fill in the form only if you haven&apos;t
										found your entity in the section above.
									</div>
								}
							/>
							<FormLine
								label={"Have you checked if the entity is in the database?"}
								type="checkbox"
								value={this.state.notFoundEntity}
								onChange={(v) => this.changeState("notFoundEntity", v)}
								background={false}
							/>
						</div>

						<div className="col-md-12">
							<FormLine
								label={this.state.fields.name}
								value={this.state.newCompanyForm.name}
								onChange={(v) => this.updateNewCompany("name", v)}
								format={!this.state.notFoundEntity ? undefined
									: (v) => PageAddCompany.isFieldCompleted(v)}
								disabled={!this.state.notFoundEntity}
							/>
							<FormLine
								label={this.state.fields.description}
								type={"textarea"}
								value={this.state.newCompanyForm.description}
								onChange={(v) => this.updateNewCompany("description", v)}
								disabled={!this.state.notFoundEntity}
							/>
							<FormLine
								label={this.state.fields.trade_register_number}
								value={this.state.newCompanyForm.trade_register_number}
								onChange={(v) => this.updateNewCompany("trade_register_number", v)}
								disabled={!this.state.notFoundEntity}
							/>
							<FormLine
								label={this.state.fields.website}
								value={this.state.newCompanyForm.website}
								onChange={(v) => this.updateNewCompany("website", v)}
								format={!this.state.notFoundEntity ? undefined
									: (v) => PageAddCompany.isFieldCompleted(v)}
								disabled={!this.state.notFoundEntity}
							/>
							<FormLine
								label={this.state.fields.creation_date}
								type={"date"}
								value={this.state.newCompanyForm.creation_date}
								onChange={(v) => this.updateNewCompany("creation_date", v)}
								format={!this.state.notFoundEntity ? undefined
									: (v) => PageAddCompany.isFieldCompleted(v)}
								disabled={!this.state.notFoundEntity}
							/>
							<FormLine
								label={this.state.fields.is_cybersecurity_core_business}
								type={"checkbox"}
								value={this.state.newCompanyForm.is_cybersecurity_core_business}
								onChange={(v) => this.updateNewCompany("is_cybersecurity_core_business", v)}
								background={false}
								disabled={!this.state.notFoundEntity}
							/>
							<FormLine
								label={this.state.fields.is_startup}
								type={"checkbox"}
								value={this.state.newCompanyForm.is_startup}
								onChange={(v) => this.updateNewCompany("is_startup", v)}
								background={false}
								disabled={!this.state.notFoundEntity}
							/>

							<div className={"right-buttons"}>
								<DialogConfirmation
									text={"Do you want to submit the company creation as a request?"}
									trigger={
										<button
											className={"blue-background"}
											disabled={
												!this.state.notFoundEntity
												|| !PageAddCompany
													.isFieldCompleted(this.state.newCompanyForm.name)
												|| !PageAddCompany
													.isFieldCompleted(this.state.newCompanyForm.website)
												|| !PageAddCompany
													.isFieldCompleted(this.state.newCompanyForm.creation_date)
											}
										>
											<i className="fas fa-save"/> Request registration
										</button>
									}
									afterConfirmation={this.submitCreationRequest}
								/>
							</div>
						</div>
					</div>
				}

			</div>
		);
	}
}
