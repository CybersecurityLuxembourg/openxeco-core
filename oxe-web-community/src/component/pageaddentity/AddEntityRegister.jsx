import React from "react";
import "./AddEntityRegister.css";
import { Link } from "react-router-dom";
import { NotificationManager as nm } from "react-notifications";
import { postRequest } from "../../utils/request.jsx";
import FormLine from "../form/FormLine.jsx";
import Info from "../box/Info.jsx";
import DialogConfirmation from "../dialog/DialogConfirmation.jsx";
import DialogHint from "../dialog/DialogHint.jsx";

export default class AddEntityRegister extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			newEntityForm: {},

			fields: {
				name: "Name",
				type: "Type",
				description: "Description",
				trade_register_number: "Trade register number",
				website: "Website",
				creation_date: "Creation date",
				is_startup: "Is startup",
			},
		};
	}

	submitCreationRequest() {
		const params = {
			type: "ENTITY ADD",
			request: "The user requests the creation of an entity",
			data: this.state.newEntityForm,
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

	updateNewEntity(field, value) {
		const c = JSON.parse(JSON.stringify(this.state.newEntityForm));
		c[field] = value;
		this.setState({ newEntityForm: c });
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	static isFieldCompleted(v) {
		return v !== undefined && v.length > 0;
	}

	render() {
		return (
			<div id="AddEntityRegister" className="max-sized-page row-spaced">
				<div className={"row row-spaced"}>
					<div className="col-md-9">
						<h2>
							Register an entity&nbsp;

							<DialogHint
								small={true}
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
												Note that the &quot;Name&quot;, &quot;Website&quot;
												and &quot;Creation date&quot; fields
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
						</h2>
					</div>

					<div className="col-md-12 row-spaced">
						<Info
							content={
								<div>
									You can register your entity here.
									Please fill in the form only if you haven&apos;t
									found your entity in
									the <Link to="/add_entity?tab=claim">Claim an entity</Link> tab.
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
							value={this.state.newEntityForm.name}
							onChange={(v) => this.updateNewEntity("name", v)}
							format={!this.state.notFoundEntity ? undefined
								: (v) => AddEntityRegister.isFieldCompleted(v)}
							disabled={!this.state.notFoundEntity}
						/>
						<FormLine
							label={this.state.fields.description}
							type={"textarea"}
							value={this.state.newEntityForm.description}
							onChange={(v) => this.updateNewEntity("description", v)}
							disabled={!this.state.notFoundEntity}
						/>
						<FormLine
							label={this.state.fields.trade_register_number}
							value={this.state.newEntityForm.trade_register_number}
							onChange={(v) => this.updateNewEntity("trade_register_number", v)}
							disabled={!this.state.notFoundEntity}
						/>
						<FormLine
							label={this.state.fields.website}
							value={this.state.newEntityForm.website}
							onChange={(v) => this.updateNewEntity("website", v)}
							format={!this.state.notFoundEntity ? undefined
								: (v) => AddEntityRegister.isFieldCompleted(v)}
							disabled={!this.state.notFoundEntity}
						/>
						<FormLine
							label={this.state.fields.creation_date}
							type={"date"}
							value={this.state.newEntityForm.creation_date}
							onChange={(v) => this.updateNewEntity("creation_date", v)}
							format={!this.state.notFoundEntity ? undefined
								: (v) => AddEntityRegister.isFieldCompleted(v)}
							disabled={!this.state.notFoundEntity}
						/>
						<FormLine
							label={this.state.fields.is_startup}
							type={"checkbox"}
							value={this.state.newEntityForm.is_startup}
							onChange={(v) => this.updateNewEntity("is_startup", v)}
							background={false}
							disabled={!this.state.notFoundEntity}
						/>

						<div className={"right-buttons"}>
							<DialogConfirmation
								text={"Do you want to submit the entity creation as a request?"}
								trigger={
									<button
										className={"blue-background"}
										disabled={
											!this.state.notFoundEntity
											|| !AddEntityRegister
												.isFieldCompleted(this.state.newEntityForm.name)
											|| !AddEntityRegister
												.isFieldCompleted(this.state.newEntityForm.website)
											|| !AddEntityRegister
												.isFieldCompleted(this.state.newEntityForm.creation_date)
										}
									>
										<i className="fas fa-save"/> Request registration
									</button>
								}
								afterConfirmation={() => this.submitCreationRequest()}
							/>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
