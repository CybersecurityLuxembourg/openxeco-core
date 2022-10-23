import React from "react";
import "./EntityGlobal.css";
import { NotificationManager as nm } from "react-notifications";
import { getForeignRequest, postRequest, getRequest } from "../../../utils/request.jsx";
import FormLine from "../../button/FormLine.jsx";
import Loading from "../../box/Loading.jsx";
import DialogAddImage from "../../dialog/DialogAddImage.jsx";

export default class EntityGlobal extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			entityEnums: null,
		};
	}

	componentDidMount() {
		this.getEntityEnums();
	}

	getEntityEnums() {
		if (this.props.node && this.props.node.api_endpoint) {
			const url = this.props.node.api_endpoint + "/public/get_public_entity_enums";

			getForeignRequest.call(this, url, (data) => {
				this.setState({
					entityEnums: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		} else {
			getRequest.call(this, "public/get_public_entity_enums", (data) => {
				this.setState({
					entityEnums: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		}
	}

	saveEntityValue(prop, value) {
		if (this.props.entity[prop] !== value) {
			const params = {
				id: this.props.id,
				[prop]: value,
			};

			postRequest.call(this, "entity/update_entity", params, () => {
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
		if (!this.props.entity || !this.state.entityEnums) {
			return <Loading height={300} />;
		}

		return (
			<div id="EntityGlobal" className={"row"}>
				{this.props.editable
					&& <div className="Entity-action-buttons-wrapper">
						<div className={"Entity-action-buttons"}>
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
						value={this.props.entity.image}
						onChange={(v) => this.saveEntityValue("image", v)}
						height={160}
						disabled={!this.props.editable}
						fullWidth={true}
					/>
				</div>

				<div className="col-md-6">
					<FormLine
						label={"ID"}
						value={this.props.entity.id}
						disabled={true}
					/>
					<FormLine
						label={"Status"}
						type={"select"}
						value={this.props.entity.status}
						options={this.state.entityEnums === null
							|| typeof this.state.entityEnums.status === "undefined" ? []
							: this.state.entityEnums.status.map((o) => ({ label: o, value: o }))}
						onChange={(v) => this.saveEntityValue("status", v)}
						disabled={!this.props.editable}
					/>
					<FormLine
						label={"Legal status"}
						type={"select"}
						value={this.props.entity.legal_status}
						options={this.state.entityEnums === null
							|| typeof this.state.entityEnums.legal_status === "undefined" ? []
							: this.state.entityEnums.legal_status.map((o) => ({ label: o, value: o }))}
						onChange={(v) => this.saveEntityValue("legal_status", v)}
						disabled={!this.props.editable}
					/>
					<FormLine
						label={"Name"}
						value={this.props.entity.name}
						onBlur={(v) => this.saveEntityValue("name", v)}
						disabled={!this.props.editable}
						fullWidth={true}
					/>
				</div>

				<div className="col-md-12">
					<h3>Definition</h3>
				</div>

				<div className="col-md-12 row-spaced">
					<FormLine
						label={"Name"}
						value={this.props.entity.name}
						disabled={true}
					/>
					<FormLine
						label={"Entity Type"}
						value={this.props.entity.entity_type}
						disabled={true}
					/>
					<FormLine
						label={"VAT Number"}
						value={this.props.entity.vat_number}
						disabled={true}
					/>
					<FormLine
						label={"Website"}
						value={this.props.entity.website}
						disabled={true}
					/>
					<FormLine
						label={"Size"}
						value={this.props.entity.size}
						disabled={true}
					/>
					<FormLine
						label={"Sector"}
						value={this.props.entity.sector}
						disabled={true}
					/>
					<FormLine
						label={"Industry"}
						value={this.props.entity.industry}
						disabled={true}
					/>
					<FormLine
						label={"Primary involvement"}
						value={this.props.entity.involvement}
						disabled={true}
					/>
				</div>

				<div className="col-md-12">
					<h3>Social network</h3>
				</div>

				<div className="col-md-12">
					<FormLine
						label={"Linkedin URL"}
						value={this.props.entity.linkedin_url}
						onBlur={(v) => this.saveEntityValue("linkedin_url", v)}
						disabled={!this.props.editable}
					/>
					<FormLine
						label={"Twitter URL"}
						value={this.props.entity.twitter_url}
						onBlur={(v) => this.saveEntityValue("twitter_url", v)}
						disabled={!this.props.editable}
					/>
					<FormLine
						label={"Youtube URL"}
						value={this.props.entity.youtube_url}
						onBlur={(v) => this.saveEntityValue("youtube_url", v)}
						disabled={!this.props.editable}
					/>
					<FormLine
						label={"Discord URL"}
						value={this.props.entity.discord_url}
						onBlur={(v) => this.saveEntityValue("discord_url", v)}
						disabled={!this.props.editable}
					/>
				</div>
			</div>
		);
	}
}
