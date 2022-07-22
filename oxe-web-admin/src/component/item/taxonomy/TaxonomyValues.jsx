import React from "react";
import "./TaxonomyValues.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import Loading from "../../box/Loading.jsx";
import Table from "../../table/Table.jsx";
import { postRequest } from "../../../utils/request.jsx";
import FormLine from "../../button/FormLine.jsx";
import DialogConfirmation from "../../dialog/DialogConfirmation.jsx";

export default class TaxonomyValues extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			newValue: "",
		};
	}

	addValue(close) {
		if (this.props.editable) {
			const params = {
				category: this.props.name,
				value: this.state.newValue,
			};

			postRequest.call(this, "taxonomy/add_taxonomy_value", params, () => {
				this.props.refresh();
				this.setState({ newValue: "" });
				if (close) {
					close();
				}
				nm.info("The value has been added");
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		} else {
			nm.warning("This taxonomy is not editable");
		}
	}

	deleteValue(value, category) {
		if (this.props.editable) {
			const params = {
				category,
				name: value,
			};

			postRequest.call(this, "taxonomy/delete_taxonomy_value", params, () => {
				this.props.refresh();
				nm.info("The value has been deleted");
			}, (response) => {
				this.refresh();
				nm.warning(response.statusText);
			}, (error) => {
				this.refresh();
				nm.error(error.message);
			});
		} else {
			nm.warning("This taxonomy is not editable");
		}
	}

	getValues() {
		if (this.props.name
			&& this.props.taxonomy
			&& this.props.taxonomy.values
			&& this.props.taxonomy.categories
			&& this.props.taxonomy.categories
				.map((c) => c.name).indexOf(this.props.name) >= 0) {
			return this.props.taxonomy.values
				.filter((v) => v.category === this.props.name);
		}

		return null;
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		const valueColumns = this.props.editable
			? [
				{
					Header: "Name",
					accessor: "name",
				},
				{
					Header: " ",
					accessor: (x) => x,
					Cell: ({ cell: { value } }) => (
						<DialogConfirmation
							text={"Are you sure you want to delete this value?"}
							trigger={
								<button
									className={"small-button red-background Table-right-button"}>
									<i className="fas fa-trash-alt"/>
								</button>
							}
							afterConfirmation={() => this.deleteValue(value.name, value.category)}
						/>
					),
					width: 50,
				},
			]
			: [
				{
					Header: "Name",
					accessor: "name",
				},
			];

		return (
			<div className={"row"}>
				<div className="col-md-9">
					<h2>Values</h2>
				</div>

				<div className="col-md-3">
					<div className="top-right-buttons">
						<Popup
							trigger={
								<button
									disabled={!this.props.editable}>
									<i className="fas fa-plus"/>
								</button>
							}
							modal
						>
							{(close) => <div className={"row row-spaced"}>
								<div className={"col-md-9"}>
									<h2>Add a new value</h2>
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

								<div className="col-md-12">
									<FormLine
										label={"Value name"}
										value={this.state.newValue}
										onChange={(v) => this.changeState("newValue", v)}
									/>
								</div>
								<div className="col-md-12 right-buttons">
									<button
										className={"blue-background"}
										disabled={!this.props.editable}
										onClick={() => this.addValue(close)}>
										<i className="fas fa-plus"/> Add value
									</button>
								</div>
							</div>}
						</Popup>
					</div>
				</div>

				<div className="col-md-12">
					{this.props.name && this.props.taxonomy
						&& this.props.taxonomy.categories
						&& this.getValues()
						? this.getValues()
							&& <div className="row">
								<div className="col-md-12">
									<Table
										keyBase={"CategoryValue"}
										columns={valueColumns}
										data={this.getValues()}
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
