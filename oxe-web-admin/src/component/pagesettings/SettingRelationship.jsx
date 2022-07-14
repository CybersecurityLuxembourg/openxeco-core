import React from "react";
import "./SettingGlobal.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, postRequest } from "../../utils/request.jsx";
import FormLine from "../button/FormLine.jsx";
import DialogConfirmation from "../dialog/DialogConfirmation.jsx";
import Table from "../table/Table.jsx";
import Loading from "../box/Loading.jsx";

export default class SettingRelationship extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			types: null,
			name: "",
			updatedName: "",
		};
	}

	componentDidMount() {
		this.getRelationshipTypes();
	}

	getRelationshipTypes() {
		getRequest.call(this, "relationship/get_relationship_types", (data) => {
			this.setState({
				types: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	addRelationshipType() {
		const params = {
			name: this.state.name,
		};

		postRequest.call(this, "relationship/add_relationship_type", params, () => {
			this.getRelationshipTypes();
			this.setState({ name: "" });
			nm.info("The relationship type has been added");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	deleteRelationshipType(name) {
		const params = {
			name,
		};

		postRequest.call(this, "relationship/delete_relationship_type", params, () => {
			this.getRelationshipTypes();
			nm.info("The relationship type has been deleted");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	updateRelationshipType(currentName, newName) {
		const params = {
			current_name: currentName,
			new_name: newName,
		};

		postRequest.call(this, "relationship/delete_relationship_type", params, () => {
			this.getRelationshipTypes();
			nm.info("The relationship type has been updated");
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
		const columns = [
			{
				Header: "Name",
				accessor: "name",
			},
			{
				Header: " ",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<div>
						<DialogConfirmation
							text={"Are you sure you want to delete this relationship type?"}
							trigger={
								<button
									className={"small-button red-background Table-right-button"}>
									<i className="fas fa-trash-alt"/>
								</button>
							}
							afterConfirmation={() => this.deleteRelationshipType(value.name)}
						/>
						<Popup
							trigger={
								<button
									className={"small-button blue-background Table-right-button"}>
									<i className="fas fa-edit"/>
								</button>
							}
							modal
						>
							{(close) => <div className={"row row-spaced"}>
								<div className={"col-md-9"}>
									<h2>Update a relationship type</h2>
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

								<div className="col-md-5">
									<FormLine
										label={"Current name"}
										value={value.name}
										disabled={true}
										fullWidth={true}
									/>
								</div>

								<div className="col-md-2">
									=&gt;
								</div>

								<div className="col-md-5">
									<FormLine
										label={"New name"}
										value={this.state.updatedName}
										onChange={(v) => this.changeState("updatedName", v)}
										fullWidth={true}
									/>
								</div>

								<div className="col-md-12">
									<div className="right-buttons">
										<button
											onClick={() => this.updateRelationshipType(
												value.name, this.state.updatedName,
											)}
											disabled={!this.state.updatedName
												|| this.state.updatedName.length < 3}>
											<i className="fas fa-edit"/> Update
										</button>
									</div>
								</div>
							</div>}
						</Popup>
					</div>
				),
				width: 50,
			},
		];

		return (
			<div id="SettingRelationship" className="fade-in">
				<div className={"row"}>
					<div className="col-md-12">
						<h1>Entity relationship</h1>
						<div className="top-right-buttons">
							<button
								onClick={() => this.getRelationshipTypes()}>
								<i className="fas fa-redo-alt"/>
							</button>
						</div>
					</div>
				</div>

				<div className={"row"}>
					<div className="col-md-12 row-spaced">
						<FormLine
							label={"Name"}
							value={this.state.name}
							onChange={(v) => this.changeState("name", v)}
						/>
						<div className="col-xl-12 right-buttons">
							<button
								className={"blue-background"}
								onClick={() => this.addRelationshipType(this.state.name)}
								disabled={!this.state.name || !this.state.types
									|| this.state.types.map((t) => t.name).indexOf(this.state.name) >= 0}>
								<i className="fas fa-plus"/> Add relationship type
							</button>
						</div>
					</div>

					<div className="col-md-12 row-spaced">
						{this.state.types
							&& <Table
								columns={columns}
								data={this.state.types}
							/>
						}

						{!this.state.types
							&& <Loading
								height={300}
							/>
						}
					</div>
				</div>
			</div>
		);
	}
}
