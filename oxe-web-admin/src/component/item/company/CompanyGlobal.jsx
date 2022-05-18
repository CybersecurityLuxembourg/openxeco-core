import React from "react";
import "./CompanyGlobal.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, getForeignRequest, postRequest } from "../../../utils/request.jsx";
import FormLine from "../../button/FormLine.jsx";
import Loading from "../../box/Loading.jsx";
import DialogAddImage from "../../dialog/DialogAddImage.jsx";

export default class CompanyGlobal extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			companyEnums: null,
		};
	}

	componentDidMount() {
		this.getCompanyEnums();
	}

	getCompanyEnums() {
		if (this.props.node && this.props.node.api_endpoint) {
			const url = this.props.node.api_endpoint + "/public/get_public_company_enums";

			getForeignRequest.call(this, url, (data) => {
				this.setState({
					companyEnums: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		} else {
			getRequest.call(this, "public/get_public_company_enums", (data) => {
				this.setState({
					companyEnums: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		}
	}

	saveCompanyValue(prop, value) {
		if (this.props.company[prop] !== value) {
			const params = {
				id: this.props.id,
				[prop]: value,
			};

			postRequest.call(this, "company/update_company", params, () => {
				this.props.refresh();
				nm.info("The property has been updated");
			}, (response) => {
				this.props.refresh();
				nm.warning(response.statusText);
			}, (error) => {
				this.props.refresh();
				nm.error(error.message);
			});
		}
	}

	render() {
		if (!this.props.company || !this.state.companyEnums) {
			return <Loading height={300} />;
		}

		return (
			<div className={"row"}>
				{this.props.editable
					&& <div className="Company-action-buttons-wrapper">
						<div className={"Company-action-buttons"}>
							<h3>Quick actions</h3>
							<div>
								<DialogAddImage
									trigger={
										<button
											className={"blue-background"}
											data-hover="Filter">
											<i className="fas fa-plus"/> Add image
										</button>
									}
								/>
							</div>
						</div>
					</div>
				}

				<div className="col-md-12">
					<h2>Global</h2>
				</div>

				<div className="col-md-12">
					<h3>Identity</h3>
				</div>

				<div className="col-md-6 row-spaced">
					<FormLine
						type={"image"}
						label={""}
						value={this.props.company.image}
						onChange={(v) => this.saveCompanyValue("image", v)}
						height={150}
						disabled={!this.props.editable}
						fullWidth={true}
					/>
				</div>

				<div className="col-md-6">
					<FormLine
						label={"Status"}
						type={"select"}
						value={this.props.company.status}
						options={this.state.companyEnums === null
							|| typeof this.state.companyEnums.status === "undefined" ? []
							: this.state.companyEnums.status.map((o) => ({ label: o, value: o }))}
						onChange={(v) => this.saveCompanyValue("status", v)}
						disabled={!this.props.editable}
					/>
					<FormLine
						label={"ID"}
						value={this.props.company.id}
						disabled={true}
					/>
					<FormLine
						label={"Name"}
						value={this.props.company.name}
						onBlur={(v) => this.saveCompanyValue("name", v)}
						disabled={!this.props.editable}
						fullWidth={true}
					/>
				</div>

				<div className="col-md-12">
					<h3>Definition</h3>
				</div>

				<div className="col-md-12 row-spaced">
					<FormLine
						label={"Description"}
						type={"textarea"}
						value={this.props.company.description}
						onBlur={(v) => this.saveCompanyValue("description", v)}
						disabled={!this.props.editable}
					/>
					<FormLine
						label={"Trade register number"}
						value={this.props.company.trade_register_number}
						onBlur={(v) => this.saveCompanyValue("trade_register_number", v)}
						disabled={!this.props.editable}
					/>
					<FormLine
						label={"Website"}
						value={this.props.company.website}
						onBlur={(v) => this.saveCompanyValue("website", v)}
						disabled={!this.props.editable}
					/>
					<FormLine
						label={"Creation date"}
						type={"date"}
						value={this.props.company.creation_date}
						onChange={(v) => this.saveCompanyValue("creation_date", v)}
						disabled={!this.props.editable}
					/>
					<FormLine
						label={"Is startup"}
						type={"checkbox"}
						value={this.props.company.is_startup}
						onChange={(v) => this.saveCompanyValue("is_startup", v)}
						disabled={!this.props.editable}
					/>
				</div>

				<div className="col-md-12">
					<h3>Social network</h3>
				</div>

				<div className="col-md-12">
					<FormLine
						label={"Linkedin URL"}
						value={this.props.company.linkedin_url}
						onBlur={(v) => this.saveCompanyValue("linkedin_url", v)}
						disabled={!this.props.editable}
					/>
					<FormLine
						label={"Twitter URL"}
						value={this.props.company.twitter_url}
						onBlur={(v) => this.saveCompanyValue("twitter_url", v)}
						disabled={!this.props.editable}
					/>
					<FormLine
						label={"Youtube URL"}
						value={this.props.company.youtube_url}
						onBlur={(v) => this.saveCompanyValue("youtube_url", v)}
						disabled={!this.props.editable}
					/>
					<FormLine
						label={"Discord URL"}
						value={this.props.company.discord_url}
						onBlur={(v) => this.saveCompanyValue("discord_url", v)}
						disabled={!this.props.editable}
					/>
				</div>
			</div>
		);
	}
}
