import React from "react";
import "./AddEntityRegister.css";
import { Link } from "react-router-dom";
import { NotificationManager as nm } from "react-notifications";
import { postRequest } from "../../utils/request.jsx";
import FormLine from "../form/FormLine.jsx";
import Info from "../box/Info.jsx";
import DialogConfirmation from "../dialog/DialogConfirmation.jsx";
import DialogHint from "../dialog/DialogHint.jsx";
import { validateEmail } from "../../utils/re.jsx";

export default class AddEntityRegisterIntro extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			email: "",
			requested: false,
		};
	}

	requestForm() {
		const params = {
			email: this.state.email,
		};
		postRequest.call(this, "/entity/request_entity_form", params, () => {
			this.props.getNotifications();
			nm.info("You will receive an email with further instructions");
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
		return (
			<div id="AddEntityRegisterIntro" className="max-sized-page row-spaced">
				<div className={"row row-spaced"}>
					<div className="col-md-9">
						<h2>Register an entity</h2>
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

					<div className="col-md-12">
						<Info
							content={
								<div>
									In order to register an entity, you need to submit the signatory
									approval form. This form needs to be signed by a signatory from
									the entity you wish to register.
									<br /><br />
									By registering an entity, you will become the primary contact for that
									entity.
									<br /><br />
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
							label={"Work email address"}
							value={this.state.email}
							onChange={(v) => this.changeState("email", v)}
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
											|| !validateEmail(this.state.email)
										}
									>
										<i className="fas fa-save"/> Request Signatory Approval Form
									</button>
								}
								afterConfirmation={() => this.requestForm()}
							/>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
