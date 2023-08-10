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
		if (this.props?.entity[prop] !== value) {
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
		if (!this.props?.entity || !this.state.entityEnums) {
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
						value={this.props?.entity?.image}
						onChange={(v) => this.saveEntityValue("image", v)}
						height={160}
						disabled={!this.props.editable}
						fullWidth={true}
					/>
				</div>

				<div className="col-md-6">
					<FormLine
						label={"ID"}
						value={this.props?.entity?.id}
						disabled={true}
					/>
					<FormLine
						label={"Status"}
						type={"select"}
						value={this.props?.entity?.status}
						options={this.state.entityEnums === null
							|| typeof this.state.entityEnums.status === "undefined" ? []
							: this.state.entityEnums.status.map((o) => ({ label: o, value: o }))}
						onChange={(v) => this.saveEntityValue("status", v)}
						disabled={!this.props.editable}
					/>
					<FormLine
						label={"Name"}
						value={this.props?.entity?.name}
						onBlur={(v) => this.saveEntityValue("name", v)}
						disabled={!this.props.editable}
						fullWidth={true}
					/>
				</div>

				<div className="col-md-12">
					<h3>Global information</h3>
				</div>

				<div className={"col-md-12 row-spaced"}>
					<FormLine
						label={"Name"}
						value={this.props?.entity?.name}
						disabled={true}
					/>
					<FormLine
						label={"Entity Type"}
						value={this.props?.entity?.entity_type || ""}
						disabled={true}
					/>
					<FormLine
						label={"VAT Number"}
						value={this.props?.entity?.vat_number || ""}
						disabled={true}
					/>
					<FormLine
						label={"Website"}
						value={this.props?.entity?.website || ""}
						disabled={true}
					/>
					<FormLine
						label={"Company Email"}
						value={this.props?.entity?.email || ""}
						disabled={true}
					/>
					<FormLine
						label={"Size"}
						value={this.props?.entity?.size || ""}
						disabled={true}
					/>
					<FormLine
						label={"Sector"}
						value={this.props?.entity?.sector || ""}
						disabled={true}
					/>
					<FormLine
						label={"Industry"}
						value={this.props?.entity?.industry || ""}
						disabled={true}
					/>
					<FormLine
						label={"Primary involvement"}
						value={this.props?.entity?.involvement || ""}
						disabled={true}
					/>
					<FormLine
						label="Authorisation by Approved Signatory"
						value={this.props?.entity?.approved_signatory?.filename}
						disabled={true}
					/>
				</div>
				<div className="col-md-12">
					<h3>Address</h3>
				</div>
				<div className={"col-md-12 row-spaced"}>
					<FormLine
						label={"Address Line 1"}
						value={this.props?.entityAddress?.address_1}
						disabled={true}
					/>
					<FormLine
						label={"Address Line 2"}
						value={this.props?.entityAddress?.address_2}
						disabled={true}
					/>
					<FormLine
						label={"Postal Code"}
						value={this.props?.entityAddress?.postal_code}
						disabled={true}
					/>
					<FormLine
						label={"City"}
						value={this.props?.entityAddress?.city}
						disabled={true}
					/>
					<FormLine
						label={"Country"}
						value={this.props?.entityAddress?.country}
						disabled={true}
					/>
				</div>

				<div className="col-md-12">
					<h3>Contact</h3>
				</div>
				<div className={"col-md-12 row-spaced"}>
					<FormLine
						label={"Contact Name"}
						value={this.props?.entityContacts?.name}
						disabled={true}
					/>

					<FormLine
						label={"Contact Email"}
						value={this.props?.entityContacts?.work_email}
						disabled={true}
					/>

					<FormLine
						label={"Work Telephone Number"}
						value={this.props?.entityContacts?.work_telephone}
						disabled={true}
					/>
				</div>
			</div>
		);
	}
}
