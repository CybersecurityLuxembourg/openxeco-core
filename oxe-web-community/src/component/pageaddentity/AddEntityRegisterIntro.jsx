import React from "react";
import "./AddEntityRegister.css";
import { Link } from "react-router-dom";
import { NotificationManager as nm } from "react-notifications";
import { postRequest } from "../../utils/request.jsx";
import FormLine from "../form/FormLine.jsx";
import Info from "../box/Info.jsx";
import DialogConfirmation from "../dialog/DialogConfirmation.jsx";
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

					<div className="col-md-12">
						<Info
							content={
								<div>
									<p>
										In order to register an entity, you need to submit the Signatory Approval
										Form. Please request the form below. You will receive an email with
										further instructions.
									</p>

									<p>
										By registering an entity, you will become the primary contact for that
										entity.
									</p>
									<p>
										Please register an entity only if you haven&apos;t
										found your entity in
										the <Link to="/add_entity?tab=claim">Claim an entity</Link> tab.
									</p>
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
