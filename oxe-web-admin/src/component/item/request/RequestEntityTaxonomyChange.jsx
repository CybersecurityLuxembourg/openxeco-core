import React, { Component } from "react";
import "./RequestEntityTaxonomyChange.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, postRequest } from "../../../utils/request.jsx";

export default class RequestEntityTaxonomyChange extends Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);
		this.addTaxonomyAssignment = this.addTaxonomyAssignment.bind(this);
		this.deleteTaxonomyAssignment = this.deleteTaxonomyAssignment.bind(this);
		this.getUpdateEntityTaxonomyBlock = this.getUpdateEntityTaxonomyBlock.bind(this);

		this.state = {
			databaseEntityTaxonomy: null,
			categoryValues: null,
		};
	}

	refresh() {
		if (this.props.data !== null && this.props.data !== undefined
			&& this.props.data.category !== null && this.props.data.category !== undefined) {
			getRequest.call(this, "taxonomy/get_taxonomy_values?category=" + this.props.data.category, (data) => {
				this.setState({
					categoryValues: data,
				}, () => {
					if (this.props.entityId !== null && this.props.entityId !== undefined) {
						getRequest.call(this, "entity/get_entity_taxonomy/"
							+ this.props.entityId, (data2) => {
							const categoryValuesIds = this.state.categoryValues.map((v) => v.id);
							this.setState({
								databaseEntityTaxonomy: data2
									.filter((d) => categoryValuesIds.indexOf(d.taxonomy_value) >= 0),
							});
						}, (response) => {
							nm.warning(response.statusText);
						}, (error) => {
							nm.error(error.message);
						});
					}
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		}
	}

	addTaxonomyAssignment(value) {
		if (this.props.data === undefined || this.props.data === null) {
			nm.warning("Data to be inserted not found");
			return;
		}

		if (this.props.entityId === undefined || this.props.entityId === undefined) {
			nm.warning("Entity ID not found");
			return;
		}

		const params = {
			entity: this.props.entityId,
			value,
		};

		postRequest.call(this, "taxonomy/add_taxonomy_assignment", params, () => {
			this.refresh();
			nm.info("The taxonomy has been updated");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	deleteTaxonomyAssignment(value) {
		if (this.props.data === undefined || this.props.data === null) {
			nm.warning("Data to be inserted not found");
			return;
		}

		if (this.props.entityId === undefined || this.props.entityId === undefined) {
			nm.warning("Entity ID not found");
			return;
		}

		const params = {
			entity: this.props.entityId,
			value,
		};

		postRequest.call(this, "taxonomy/delete_taxonomy_assignment", params, () => {
			this.refresh();
			nm.info("The taxonomy has been updated");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getUpdateEntityTaxonomyBlock() {
		if (this.state.databaseEntityTaxonomy === null
			|| this.state.categoryValues === null) {
			return "";
		}

		if (this.props.data === null || this.props.data === undefined
			|| this.props.data.category === undefined || this.props.data.values === undefined) {
			nm.warning("The request data is not complete. Please contact admin");
			return "";
		}

		const databaseTaxonomyId = this.state.databaseEntityTaxonomy.map((t) => t.taxonomy_value);
		const taxonomyIds = [...new Set(databaseTaxonomyId.concat(this.props.data.values))];

		return (
			<div className="col-md-12">
				{taxonomyIds.map((f) => (
					<div className="row" key={f}>
						<div className="col-md-12">
							<h4>{this.state.categoryValues.filter((v) => v.id === f).length > 0
								? this.state.categoryValues.filter((v) => v.id === f)[0].name
								: "Unfound value"
							}</h4>
						</div>

						{databaseTaxonomyId.filter((i) => i === f).length === 0
							&& this.props.data.values.filter((i) => i === f).length > 0
							&& <div className="col-md-8">
								<div className="blue-font">The user requests to add this value</div>
							</div>
						}

						{databaseTaxonomyId.filter((i) => i === f).length === 0
							&& this.props.data.values.filter((i) => i === f).length > 0
							&& <div className="col-md-4">
								<button
									className={"blue-background"}
									onClick={() => this.addTaxonomyAssignment(f)}>
									<i className="fas fa-plus"/> Add this value
								</button>
							</div>
						}

						{databaseTaxonomyId.filter((i) => i === f).length > 0
							&& this.props.data.values.filter((i) => i === f).length === 0
							&& <div className="col-md-8">
								<div className="red-font">The user requests to remove this value</div>
							</div>
						}

						{databaseTaxonomyId.filter((i) => i === f).length > 0
							&& this.props.data.values.filter((i) => i === f).length === 0
							&& <div className="col-md-4">
								<button
									className={"red-background"}
									onClick={() => this.deleteTaxonomyAssignment(f)}>
									<i className="fas fa-trash-alt"/> Delete this value
								</button>
							</div>
						}

						{databaseTaxonomyId.filter((i) => i === f).length > 0
							&& this.props.data.values.filter((i) => i === f).length > 0
							&& <div className="col-md-12">
								The users agrees with this assignment
							</div>
						}
					</div>
				))}
			</div>
		);
	}

	render() {
		return (
			<Popup
				className="Popup-small-size"
				trigger={
					<button
						className={"blue-background"}
					>
						<i className="fas fa-tasks"/> Review entity taxonomy changes
					</button>
				}
				modal
				onOpen={this.refresh}
			>
				{(close) => (
					<div className="row row-spaced">
						<div className="col-md-12">
							<h2>Review entity taxonomy changes</h2>

							<div className={"top-right-buttons"}>
								<button
									className={"grey-background"}
									onClick={close}>
									<i className="far fa-times-circle"/>
								</button>
							</div>
						</div>

						{this.props.data !== null && this.getUpdateEntityTaxonomyBlock()}
					</div>
				)}
			</Popup>
		);
	}
}
