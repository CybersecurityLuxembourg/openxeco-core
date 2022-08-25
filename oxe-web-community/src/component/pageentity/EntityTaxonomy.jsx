import React from "react";
import "./EntityTaxonomy.css";
import _ from "lodash";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, postRequest } from "../../utils/request.jsx";
import DialogConfirmation from "../dialog/DialogConfirmation.jsx";
import TreeTaxonomy from "../chart/TreeTaxonomy.jsx";
import Loading from "../box/Loading.jsx";
import Message from "../box/Message.jsx";
import FormLine from "../form/FormLine.jsx";
import DialogHint from "../dialog/DialogHint.jsx";

export default class EntityTaxonomy extends React.Component {
	constructor(props) {
		super(props);

		this.selectCategory = this.selectCategory.bind(this);
		this.updateCurrentSelectedValues = this.updateCurrentSelectedValues.bind(this);

		this.state = {
			taxonomy: null,
			entityTaxonomy: null,

			categoryOptions: [],
			selectedCategory: null,

			originalSelectedValues: null,
			currentSelectedValues: null,
		};
	}

	componentDidMount() {
		this.getTaxonomy();
		this.getEntityTaxonomy();
	}

	componentDidUpdate(i, prevState) {
		if (this.state.taxonomy !== null && this.state.entityTaxonomy !== null
			&& (prevState.taxonomy === null || prevState.entityTaxonomy === null)) {
			if (this.state.taxonomy.values === undefined) {
				nm.warning("No taxonomy values found");
			}

			const parentCategories = this.state.taxonomy.category_hierarchy.map((h) => h.parent_category);

			this.setState({
				categoryOptions:
					this.state.taxonomy.categories
						.filter((c) => c.active_on_entities)
						.filter((c) => parentCategories.indexOf(c.name) < 0)
						.map((c) => ({
							label: c.name,
							value: c.name,
						})),
			});
		}
	}

	getTaxonomy() {
		this.setState({
			taxonomy: null,
		});

		getRequest.call(this, "public/get_public_taxonomy", (data) => {
			this.setState({
				taxonomy: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getEntityTaxonomy() {
		this.setState({
			entityTaxonomy: null,
		});

		getRequest.call(this, "private/get_my_entity_taxonomy/" + this.props.entityId, (data) => {
			this.setState({
				entityTaxonomy: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	submitModificationRequests() {
		const params = {
			type: "ENTITY TAXONOMY CHANGE",
			request: "The user requests modifications on taxonomy of an entity on the category "
				+ this.state.selectedCategory,
			entity_id: this.props.entityId,
			data: {
				category: this.state.selectedCategory,
				values: this.state.currentSelectedValues,
			},
		};

		postRequest.call(this, "private/add_request", params, () => {
			this.props.getNotifications();
			nm.info("The request has been sent and will be reviewed");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	updateCurrentSelectedValues(values) {
		this.setState({ currentSelectedValues: values });
	}

	selectCategory(value) {
		if (this.state.taxonomy !== undefined) {
			const categoryValues = this.state.taxonomy.values
				.filter((v) => v.category === value)
				.map((v) => v.id);
			const entityValues = this.state.entityTaxonomy
				.filter((v) => categoryValues.indexOf(v.taxonomy_value) >= 0)
				.map((v) => v.taxonomy_value);

			this.setState({
				selectedCategory: value,
				originalSelectedValues: entityValues,
				currentSelectedValues: entityValues,
			});
		}
	}

	getAddedValues() {
		if (this.state.originalSelectedValues !== null
			&& this.state.currentSelectedValues !== null) {
			const addedValues = this.state.currentSelectedValues
				.filter((v) => this.state.originalSelectedValues.indexOf(v) < 0);

			return this.state.taxonomy.values
				.filter((v) => addedValues.indexOf(v.id) >= 0);
		}

		return [];
	}

	getRemovedValues() {
		if (this.state.originalSelectedValues !== null
			&& this.state.currentSelectedValues !== null) {
			const removedValues = this.state.originalSelectedValues
				.filter((v) => this.state.currentSelectedValues.indexOf(v) < 0);

			return this.state.taxonomy.values
				.filter((v) => removedValues.indexOf(v.id) >= 0);
		}

		return [];
	}

	render() {
		if (this.state.taxonomy === null
			|| this.state.taxonomy === undefined
			|| this.state.entityTaxonomy === null
			|| this.state.entityTaxonomy === undefined) {
			return <Loading
				height={300}
			/>;
		}

		return (
			<div id="EntityTaxonomy" className="max-sized-page fade-in">
				<div className={"row"}>
					<div className="col-md-9">
						<h2>Taxonomy</h2>
					</div>

					<div className="col-md-3 top-title-menu">
						<DialogHint
							content={
								<div className="row">
									<div className="col-md-12">
										<h2>How can I modify the taxonomy of my entity?</h2>

										<p>
											Select the taxonomy category from the drop-down menu:
										</p>

										<img src="/img/hint-taxonomy-select.png"/>

										<p>
											You can see the taxonomy tree with the current selection.
											A blue circle means that the entity is assigned to
											the value and a red circle means that it is not.
										</p>

										<img src="/img/hint-taxonomy-tree.png"/>

										<p>
											If you want to change the selection, unlock the diagram
											by clicking on the top right button:
										</p>

										<img src="/img/hint-taxonomy-lock-button.png"/>

										<p>
											By clicking on the coloured circles, you will modify the
											selection. Once done, you can consult the differencies
											at the bottom of the tree.
										</p>

										<img src="/img/hint-taxonomy-differences.png"/>

										<p>
											You will complete the modifications by selecting the
											following button.
										</p>

										<img src="/img/hint-taxonomy-modif-button.png"/>

										<p>
											This will send a request to the administration team, who will
											either accept or reject your request.
										</p>

										<h2>Note</h2>

										<p>
											You can follow up your requests by going on this menu:
										</p>

										<img src="/img/hint-request-menu.png"/>
									</div>
								</div>
							}
						/>
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<FormLine
							label={"Category"}
							type={"select"}
							options={this.state.categoryOptions}
							value={this.state.selectedCategory}
							onChange={(v) => this.selectCategory(v)}
						/>
					</div>
				</div>

				{this.state.selectedCategory === null
					&& <div className={"row"}>
						<div className="col-md-12">
							<Message
								text={"Please select a taxonomy category"}
								height={200}
							/>
						</div>
					</div>
				}

				{this.state.selectedCategory !== null
					&& <div className={"row"}>
						<div className="col-md-12">
							<TreeTaxonomy
								category={this.state.selectedCategory}
								selectedValues={this.state.currentSelectedValues}
								categories={this.state.taxonomy !== null
									&& this.state.taxonomy.categories !== undefined
									? this.state.taxonomy.categories : null}
								categoryHierarchy={this.state.taxonomy !== null
									&& this.state.taxonomy.category_hierarchy !== undefined
									? this.state.taxonomy.category_hierarchy : null}
								values={this.state.taxonomy !== null
									&& this.state.taxonomy.values !== undefined
									? this.state.taxonomy.values : null}
								valueHierarchy={this.state.taxonomy !== null
									&& this.state.taxonomy.value_hierarchy !== undefined
									? this.state.taxonomy.value_hierarchy : null}
								updateSelection={(selectedValues) => this
									.updateCurrentSelectedValues(selectedValues)}
							/>
						</div>

						{this.getAddedValues().map((v) => <div
							className="col-md-12 EntityTaxonomy-added"
							key={v.id}>
							You added: {v.name}
						</div>)}

						{this.getRemovedValues().map((v) => <div
							className="col-md-12 EntityTaxonomy-removed"
							key={v.id}>
							You removed: {v.name}
						</div>)}

						<div className="col-md-12">
							<div className={"right-buttons"}>
								<DialogConfirmation
									text={"Do you want to request modifications for this taxonomy?"}
									trigger={
										<button
											className={"blue-background"}
											disabled={_.isEqual(
												this.state.currentSelectedValues,
												this.state.originalSelectedValues,
											)}
										>
											<i className="fas fa-save"/> Request modifications...
										</button>
									}
									afterConfirmation={() => this.submitModificationRequests()}
								/>
								<button
									className={"blue-background"}
									disabled={_.isEqual(
										this.state.currentSelectedValues,
										this.state.originalSelectedValues,
									)}
									onClick={() => this.setState({
										currentSelectedValues: this.state.originalSelectedValues,
									})}
								>
									<i className="fas fa-undo-alt"/>
								</button>
							</div>
						</div>
					</div>
				}
			</div>
		);
	}
}
