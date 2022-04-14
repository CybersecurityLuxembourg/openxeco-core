import React from "react";
import "./FormGlobal.css";
import { NotificationManager as nm } from "react-notifications";
import Loading from "../../box/Loading.jsx";
import { getRequest, postRequest } from "../../../utils/request.jsx";
import FormLine from "../../button/FormLine.jsx";

export default class FormGlobal extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			newValue: "",
			formEnums: null,
		};
	}

	componentDidMount() {
		this.getFormEnums();
	}

	updateForm(field, value) {
		const params = {
			id: this.props.form.id,
			[field]: value,
		};

		postRequest.call(this, "form/update_form", params, () => {
			this.props.refresh();
			nm.info("The form has been updated");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getFormEnums() {
		getRequest.call(this, "form/get_form_enums", (data) => {
			this.setState({
				formEnums: data,
			});
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
			<div id="FormGlobal" className={"row"}>
				<div className="col-md-12">
					<h2>Global</h2>
				</div>

				<div className="col-md-12">
					{this.props.form && this.state.formEnums
						? <div className="row">
							<div className="col-md-12">
								<FormLine
									label={"ID"}
									value={this.props.form.id}
									disabled={true}
								/>
								<FormLine
									label={"Name"}
									value={this.props.form.name}
									disabled={this.props.form.status === "DELETED"}
									onBlur={(v) => this.updateForm("name", v)}
								/>
								<FormLine
									label={"Description"}
									value={this.props.form.description}
									disabled={this.props.form.status === "DELETED"}
									onBlur={(v) => this.updateForm("description", v)}
								/>
								<FormLine
									label={"Status"}
									type={"select"}
									options={this.state.formEnums.status.map((o) => ({
										label: o,
										value: o,
									}))}
									value={this.props.form.status}
									disabled={this.props.form.status === "DELETED"}
									onChange={(v) => this.updateForm("status", v)}
								/>
							</div>
						</div>
						: <Loading
							height={300}
						/>
					}
				</div>
			</div>
		);
	}
}
