import React from "react";
import "./Contact.css";
import _ from "lodash";
import { NotificationManager as nm } from "react-notifications";
import FormLine from "./FormLine.jsx";
import { postRequest } from "../../utils/request.jsx";
import { validateNotNull, validateEmail } from "../../utils/re.jsx";
import DialogConfirmation from "../dialog/DialogConfirmation.jsx";

export default class Contact extends React.Component {
	constructor(props) {
		super(props);

		this.save = this.save.bind(this);
		this.remove = this.remove.bind(this);
		this.changeInfoState = this.changeInfoState.bind(this);
		this.changeState = this.changeState.bind(this);

		this.state = {
			defaultInfo: props.info,
			info: props.info,
		};
	}

	componentDidUpdate(prevProps) {
		if (prevProps.info !== this.props.info) {
			this.setState({
				info: this.props.info,
				defaultInfo: this.props.info,
			});
		}
	}

	save() {
		if (this.state.info.id !== undefined) {
			const params = _.cloneDeep(this.state.info);
			delete params.company_id;

			postRequest.call(this, "contact/update_contact", params, () => {
				if (this.props.afterAction !== undefined) {
					this.props.afterAction();
				}

				nm.info("The contact has been updated");
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		} else {
			postRequest.call(this, "contact/add_contact", this.state.info, () => {
				if (this.props.afterAction !== undefined) {
					this.props.afterAction();
				}

				nm.info("The contact has been added");
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		}
	}

	remove() {
		if (typeof this.state.info.id !== "undefined") {
			const params = {
				id: this.state.info.id,
			};

			postRequest.call(this, "contact/delete_contact", params, () => {
				if (this.props.afterAction !== undefined) {
					this.props.afterAction();
				}

				nm.info("The contact has been removed");
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		} else {
			this.props.afterAction();
		}
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	changeInfoState(field, value) {
		const info = _.cloneDeep(this.state.info);
		info[field] = value;
		this.setState({ info });
	}

	render() {
		return (
			<div className="row row-spaced">
				<div className="col-md-12">
					<FormLine
						label={"Type of contact info"}
						type={"select"}
						value={this.state.info.type}
						options={this.props.enums === null
                            || this.props.enums.type === undefined
							? []
							: [{ value: null, label: "-" }].concat(
								this.props.enums.type.map((o) => ({ label: o, value: o })),
							)}
						onChange={(v) => this.changeInfoState("type", v)}
						format={validateNotNull}
					/>
					<FormLine
						label={"Representative"}
						type={"select"}
						value={this.state.info.representative}
						options={this.props.enums === null
                            || this.props.enums.representative === undefined
							? []
							: [{ value: null, label: "-" }].concat(
								this.props.enums.representative.map((o) => ({ label: o, value: o })),
							)}
						onChange={(v) => this.changeInfoState("representative", v)}
						format={validateNotNull}
					/>
					<FormLine
						label={"Department"}
						type={"select"}
						value={this.state.info.department}
						options={this.props.enums === null
                            || this.props.enums.department === undefined
							? []
							: [{ value: null, label: "-" }].concat(
								this.props.enums.department.map((o) => ({ label: o, value: o })),
							)}
						onChange={(v) => this.changeInfoState("department", v)}
						format={validateNotNull}
					/>
					{this.state.info.representative !== undefined
						&& this.state.info.representative === "PHYSICAL PERSON"
						&& <FormLine
							label={"First and family name"}
							value={this.state.info.name}
							onChange={(v) => this.changeInfoState("name", v)}
							format={validateNotNull}
						/>
					}

					{this.state.info !== undefined && this.state.info.type === "PHONE NUMBER"
						&& <FormLine
							type={"phone"}
							label={"Phone number"}
							value={this.state.info.value}
							onChange={(v) => this.changeInfoState("value", v)}
							format={validateNotNull}
						/>}

					{this.state.info !== undefined && this.state.info.type === "EMAIL ADDRESS"
						&& <FormLine
							label={"Email address"}
							value={this.state.info.value}
							onChange={(v) => this.changeInfoState("value", v)}
							format={validateEmail}
						/>}

				</div>
				<div className={"col-md-12"}>
					<div className="right-buttons">
						<button
							className={"blue-background"}
							onClick={() => this.save()}
							disabled={this.state.info.company_id === undefined
								|| !validateNotNull(this.state.info.type)
								|| !validateNotNull(this.state.info.representative)
								|| (this.state.info.type === "PHONE NUMBER"
									&& !validateNotNull(this.state.info.value))
								|| (this.state.info.type === "EMAIL ADDRESS"
									&& !validateEmail(this.state.info.value))
								|| (this.state.info.representative === "PHYSICAL PERSON"
									&& !validateNotNull(this.state.info.name))
								|| _.isEqual(this.props.info, this.state.info)}
						>
							<i className="fas fa-save"/>
						</button>
						<DialogConfirmation
							text={"Are you sure you want to delete this contact point?"}
							trigger={
								<button
									className={"red-background"}>
									<i className="fas fa-trash-alt"/>
								</button>
							}
							afterConfirmation={() => this.remove()}
						/>
					</div>
				</div>
			</div>
		);
	}
}
