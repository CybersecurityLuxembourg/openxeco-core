import React from "react";
import "./AddCompanyClaim.css";
import { Link } from "react-router-dom";
import { NotificationManager as nm } from "react-notifications";
import Popup from "reactjs-popup";
import Loading from "../box/Loading.jsx";
import { getRequest, postRequest } from "../../utils/request.jsx";
import FormLine from "../form/FormLine.jsx";
import Message from "../box/Message.jsx";
import DialogConfirmation from "../dialog/DialogConfirmation.jsx";
import DialogHint from "../dialog/DialogHint.jsx";
import { getUrlParameter } from "../../utils/url.jsx";
import Info from "../box/Info.jsx";

export default class PageAddCompany extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			companies: null,
			filteredCompanies: null,
			searchField: null,
			notFoundEntity: false,
			userCompaniesEnums: null,
		};
	}

	componentDidMount() {
		this.refreshCompanies();
		this.getUserCompanyEnums();

		if (getUrlParameter("claim_entity")) {
			this.onClaimEntityPopupOpen();
		}
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
			nm.warning(response.statusText);
		}, (error) => {
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

	submitClaimRequest(companyId, close) {
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
			if (close) {
				close();
			}
			nm.info("The request has been sent and will be reviewed");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	filterCompanies() {
		if (!this.state.searchField || this.state.searchField.length < 2) {
			this.setState({ filteredCompanies: null });
		} else {
			this.setState({
				filteredCompanies: this.state.companies
					.filter((c) => c.name.toLowerCase().includes(this.state.searchField.toLowerCase())),
			});
		}
	}

	onClaimEntityPopupOpen() {
		getRequest.call(this, "public/get_public_company/" + getUrlParameter("claim_entity"), (data) => {
			this.setState({
				company: data,
			});
		}, (response) => {
			this.setState({
				company: "Entity not found",
			});
			nm.warning(response.statusText);
		}, (error) => {
			this.setState({
				company: "Entity not found",
			});
			nm.error(error.message);
		});
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<div id="PageAddCompany" className="max-sized-page row-spaced">
				{this.state.companies === null
					? <Loading
						height={200}
					/>
					: <div className={"row row-spaced"}>
						<div className="col-md-9">
							<h2>Claim an entity</h2>
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

						<div className="col-md-12">
							<Info
								content={
									<div>
										Find and claim your entity here.
										If you haven&apos;t
										found your entity, please fill in the form in
										the <Link to="/add_company?tab=register">Register an entity</Link> tab.
									</div>
								}
							/>
						</div>

						<div className="col-md-12 row-spaced">
							<FormLine
								label={"Type at least 2 characters to find your entity"}
								value={this.state.searchField}
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
																		afterConfirmation={() => this.submitClaimRequest(c.id, close)}
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
					</div>
				}

				<Popup
					className="Popup-small-size"
					modal
					closeOnDocumentClick
					open={getUrlParameter("claim_entity") !== null}
					onOpen={() => this.onClaimEntityPopupOpen()}
				>
					{(close) => (
						<div className="row">
							<div className="col-md-9 row-spaced">
								<h3>Claim access to the entity</h3>
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

							{this.state.company && typeof this.state.company === "object"
								&& <div className="col-md-12">
									<FormLine
										label={"Entity"}
										value={this.state.company.name}
										disabled={true}
									/>

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

									<div className="right-buttons">
										<DialogConfirmation
											text={"Do you want to request access to: " + this.state.company.name + "?"}
											trigger={
												<button
													className={"blue-background card-button"}
												>
													Claim access...
												</button>
											}
											afterConfirmation={() => this.submitClaimRequest(this.state.company.id)}
										/>
									</div>
								</div>
							}

							{this.state.company && typeof this.state.company !== "object"
								&& <div className="col-md-12">
									<Message
										className={"PageAddCompany-claim-message"}
										height={200}
										text={<div>
											<div><i className="fas fa-exclamation-circle"/></div>
											<div>{this.state.company}</div>
										</div>}
									/>
								</div>
							}

							{!this.state.company
								&& <Loading
									height={200}
								/>
							}
						</div>
					)}
				</Popup>
			</div>
		);
	}
}
