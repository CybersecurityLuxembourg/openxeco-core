import React from "react";
import "./AddEntityClaim.css";
import { Link } from "react-router-dom";
import { NotificationManager as nm } from "react-notifications";
import Popup from "reactjs-popup";
import Loading from "../box/Loading.jsx";
import { validateEmail, validateTelephoneNumber } from "../../utils/re.jsx";
import { getRequest, postRequest } from "../../utils/request.jsx";
import FormLine from "../form/FormLine.jsx";
import Message from "../box/Message.jsx";
import DialogConfirmation from "../dialog/DialogConfirmation.jsx";
// import DialogHint from "../dialog/DialogHint.jsx";
import { getUrlParameter } from "../../utils/url.jsx";
import Info from "../box/Info.jsx";

export default class PageAddEntity extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			email: "",
			telephone: "",
			level: "",
			department: "",
			entities: null,
			filteredEntities: null,
			searchField: null,
			notFoundEntity: false,
			departments: [],
		};
	}

	componentDidMount() {
		this.refreshEntities();

		if (getUrlParameter("claim_entity")) {
			this.onClaimEntityPopupOpen();
		}

		getRequest.call(this, "public/get_public_departments", (data) => {
			this.setState({
				departments: data,
			});
		}, (error) => {
			nm.warning(error.message);
		}, (error) => {
			nm.error(error.message);
		});
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevState.searchField !== this.state.searchField) {
			this.filterEntities();
		}
	}

	refreshEntities() {
		getRequest.call(this, "public/get_public_entities", (data) => {
			this.setState({
				entities: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	isFormValid() {
		if (this.state.department === ""
			|| this.state.email === ""
			|| this.state.telephone === ""
			|| this.state.level === ""
		) {
			return false;
		}
		if (validateEmail(this.state.email)) {
			return true;
		}
		return false;
	}

	submitClaimRequest(entityId, close) {
		const params = {
			type: "ENTITY ASSOCIATION CLAIM",
			request: "The user requests access to an entity",
			data: {
				entity_id: entityId,
				department: this.state.department,
				email: this.state.email,
				telephone: this.state.telephone,
				level: this.state.level,
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

	filterEntities() {
		if (!this.state.searchField || this.state.searchField.length < 2) {
			this.setState({ filteredEntities: null });
		} else {
			this.setState({
				filteredEntities: this.state.entities
					.filter((c) => c.name.toLowerCase().includes(this.state.searchField.toLowerCase())),
			});
		}
	}

	onClaimEntityPopupOpen() {
		getRequest.call(this, "public/get_public_entity/" + getUrlParameter("claim_entity"), (data) => {
			this.setState({
				entity: data,
			});
		}, (response) => {
			this.setState({
				entity: "Entity not found",
			});
			nm.warning(response.statusText);
		}, (error) => {
			this.setState({
				entity: "Entity not found",
			});
			nm.error(error.message);
		});
	}

	formValid() {
		if (!validateEmail(this.state.email)
			|| (
				this.state.work_telephone !== ""
				&& !validateTelephoneNumber(this.state.telephone)
			)
			|| this.state.level === ""
			|| this.state.department === ""
		) {
			return false;
		}
		return true;
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<div id="PageAddEntity" className="max-sized-page row-spaced">
				{this.state.entities === null
					? <Loading
						height={200}
					/>
					: <div className={"row row-spaced"}>
						<div className="col-md-9">
							<h2>Associate with an entity</h2>
						</div>

						{/* <div className="col-md-3 top-title-menu">
							<DialogHint
								content={
									<div className="row">
										<div className="col-md-12">
											<h2>Why associating to an entity?</h2>

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
												Type the entity name in the text field shown below.
												You need to type at least 2 characters to perform the search.
											</p>

											<img src="/img/hint-search-claim-entity.png"/>

											<p>
												Then, you will see the list of entities matching
												your search. By clicking on the &quot;Claim access&quot;
												button, you have claimed the assignment to the chosen entity.
											</p>

											<img src="/img/hint-entity-claim-button.png"/>

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
						</div> */}

						<div className="col-md-12">
							<Info
								content={
									<div>
										Find and associate with your entity here.
										If you haven&apos;t
										found your entity, please fill in the form in
										the <Link to="/add_entity?tab=register">Register an entity</Link> tab.
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
							{this.state.filteredEntities === null
								&& <Message
									text={"Search amongst " + this.state.entities.length + " entities"}
									height={150}
								/>
							}

							{this.state.filteredEntities !== null
								&& this.state.filteredEntities.length === 0
								&& <Message
									text={"No entity found"}
									height={150}
								/>
							}

							<div className={"row"}>
								{this.state.filteredEntities !== null
									&& this.state.filteredEntities.length > 0
									&& this.state.filteredEntities.map((c) => <div
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
															Associate...
														</button>
													}
													modal
													closeOnDocumentClick
												>
													{(close) => (
														<div className="row">
															<div className="col-md-9 row-spaced">
																<h3>Entity Association Details</h3>
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
																	label="Work Email *"
																	value={this.state.email}
																	onChange={(v) => this.changeState("email", v)}
																	autofocus={true}
																	onKeyDown={this.onKeyDown}
																/>
																{!validateEmail(this.state.email) && this.state.email !== ""
																	&& <div className="row">
																		<div className="col-md-6"></div>
																		<div className="col-md-6">
																			<div className="validation-error">
																				Please enter a valid email address
																			</div>
																		</div>
																	</div>
																}
																<FormLine
																	label="Work Telephone Number *"
																	value={this.state.telephone}
																	onChange={(v) => this.changeState("telephone", v)}
																	autofocus={true}
																	onKeyDown={this.onKeyDown}
																/>
																{!validateTelephoneNumber(this.state.telephone) && this.state.telephone !== ""
																	&& <div className="row">
																		<div className="col-md-6"></div>
																		<div className="col-md-6">
																			<div className="validation-error">
																				Accepted Format: +1234567891, 1234567891
																			</div>
																		</div>
																	</div>
																}
																<FormLine
																	label={"Seniority Level *"}
																	type={"select"}
																	options={[
																		{ value: "Board Member", label: "Board Member" },
																		{ value: "Executive Management", label: "Executive Management" },
																		{ value: "Senior Management", label: "Senior Management" },
																		{ value: "Management", label: "Management" },
																		{ value: "Senior", label: "Senior" },
																		{ value: "Intermediate", label: "Intermediate" },
																		{ value: "Entry-Level", label: "Entry-Level" },
																	]}
																	value={this.props.level}
																	onChange={(v) => this.setState({ level: v })}
																/>
																{this.state.departments
																	? <FormLine
																		label={"Department *"}
																		type={"select"}
																		options={this.state.departments
																			? this.state.departments
																				.map((d) => ({ label: d.name, value: d.name }))
																			: []
																		}
																		value={this.state.department}
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
																				disabled={this.formValid() === false}
																			>
																				Associate...
																			</button>
																		}
																		disabled={
																			!this.isFormValid()
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
								<h3>Associate with the entity</h3>
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

							{this.state.entity && typeof this.state.entity === "object"
								&& <div className="col-md-12">
									<FormLine
										label={"Entity"}
										value={this.state.entity.name}
										disabled={true}
									/>

									{this.state.departments
										? <FormLine
											label={"Department"}
											type={"select"}
											options={this.state.departments
												? this.state.departments
													.map((d) => ({ label: d.name, value: d.id }))
												: []
											}
											value={this.state.department}
											onChange={(v) => this.setState({ department: v })}
										/>
										: <Loading
											height={200}
										/>
									}

									<div className="right-buttons">
										<DialogConfirmation
											text={"Do you want to request access to: " + this.state.entity.name + "?"}
											trigger={
												<button
													className={"blue-background card-button"}
												>
													Associate...
												</button>
											}
											afterConfirmation={() => this.submitClaimRequest(this.state.entity.id)}
										/>
									</div>
								</div>
							}

							{this.state.entity && typeof this.state.entity !== "object"
								&& <div className="col-md-12">
									<Message
										className={"PageAddEntity-claim-message"}
										height={200}
										text={<div>
											<div><i className="fas fa-exclamation-circle"/></div>
											<div>{this.state.entity}</div>
										</div>}
									/>
								</div>
							}

							{!this.state.entity
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
