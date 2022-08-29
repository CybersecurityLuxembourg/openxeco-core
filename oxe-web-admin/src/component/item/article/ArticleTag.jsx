import React from "react";
import "./ArticleTag.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, postRequest } from "../../../utils/request.jsx";
import FormLine from "../../button/FormLine.jsx";
import Message from "../../box/Message.jsx";
import Loading from "../../box/Loading.jsx";

export default class ArticleTag extends React.Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);
		this.addTaxonomyTag = this.addTaxonomyTag.bind(this);
		this.addEntityTag = this.addEntityTag.bind(this);
		this.deleteTaxonomyTag = this.deleteTaxonomyTag.bind(this);
		this.deleteEntityTag = this.deleteEntityTag.bind(this);
		this.changeState = this.changeState.bind(this);

		this.state = {
			entities: null,
			taxonomyValues: null,
			taxonomyCategories: null,
			selectedEntities: null,
			selectedTaxonomyValues: null,
		};
	}

	componentDidMount() {
		this.refresh();
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevState.selectedEntities !== this.state.selectedEntities
            && prevState.selectedEntities !== null && this.state.selectedEntities !== null) {
			if (prevState.selectedEntities.length > this.state.selectedEntities.length) {
				const removedEl = prevState.selectedEntities
					.filter((x) => !this.state.selectedEntities.includes(x));
				this.deleteEntityTag(removedEl[0]);
			} else {
				const removedEl = this.state.selectedEntities
					.filter((x) => !prevState.selectedEntities.includes(x));
				this.addEntityTag(removedEl[0]);
			}
		}

		if (prevState.selectedTaxonomyValues !== this.state.selectedTaxonomyValues
            && prevState.selectedTaxonomyValues !== null
            && this.state.selectedTaxonomyValues !== null) {
			if (prevState.selectedTaxonomyValues.length > this.state.selectedTaxonomyValues.length) {
				const removedEl = prevState.selectedTaxonomyValues
					.filter((x) => !this.state.selectedTaxonomyValues.includes(x));
				this.deleteTaxonomyTag(removedEl[0]);
			} else {
				const removedEl = this.state.selectedTaxonomyValues
					.filter((x) => !prevState.selectedTaxonomyValues.includes(x));
				this.addTaxonomyTag(removedEl[0]);
			}
		}
	}

	refresh() {
		this.setState({
			entities: null,
			taxonomyValues: null,
			taxonomyCategories: null,
			selectedEntities: null,
			selectedTaxonomyValues: null,
		});

		getRequest.call(this, "taxonomy/get_taxonomy_values", (data) => {
			this.setState({
				taxonomyValues: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "taxonomy/get_taxonomy_categories", (data) => {
			this.setState({
				taxonomyCategories: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "entity/get_entities", (data) => {
			this.setState({
				entities: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "article/get_article_tags/" + this.props.id, (data) => {
			this.setState({
				selectedEntities: data.entity_tags.map((t) => t.id),
				selectedTaxonomyValues: data.taxonomy_tags.map((t) => t.id),
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	addTaxonomyTag(taxonomyValueID) {
		const params = {
			article_id: this.props.id,
			taxonomy_value_id: taxonomyValueID,
		};

		postRequest.call(this, "article/add_taxonomy_tag", params, () => {
			this.refresh();
		}, (response) => {
			this.refresh();
			nm.warning(response.statusText);
		}, (error) => {
			this.refresh();
			nm.error(error.message);
		});
	}

	addEntityTag(entityID) {
		const params = {
			article_id: this.props.id,
			entity_id: entityID,
		};

		postRequest.call(this, "article/add_entity_tag", params, () => {
			this.refresh();
		}, (response) => {
			this.refresh();
			nm.warning(response.statusText);
		}, (error) => {
			this.refresh();
			nm.error(error.message);
		});
	}

	deleteTaxonomyTag(taxonomyValueID) {
		const params = {
			article_id: this.props.id,
			taxonomy_value_id: taxonomyValueID,
		};

		postRequest.call(this, "article/delete_taxonomy_tag", params, () => {
			this.refresh();
		}, (response) => {
			this.refresh();
			nm.warning(response.statusText);
		}, (error) => {
			this.refresh();
			nm.error(error.message);
		});
	}

	deleteEntityTag(entityID) {
		const params = {
			article_id: this.props.id,
			entity_id: entityID,
		};

		postRequest.call(this, "article/delete_entity_tag", params, () => {
			this.refresh();
		}, (response) => {
			this.refresh();
			nm.warning(response.statusText);
		}, (error) => {
			this.refresh();
			nm.error(error.message);
		});
	}

	getTaxonomyValuesForArticles() {
		const acceptedCategories = this.state.taxonomyCategories
			.filter((c) => c.active_on_articles)
			.map((c) => c.name);

		return this.state.taxonomyValues
			.filter((v) => acceptedCategories.indexOf(v.category) >= 0);
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		if (this.props.node) {
			return <Message
				text={"Not applicable on remote article"}
				height={300}
			/>;
		}

		if (!this.state.entities || !this.state.taxonomyValues || !this.state.taxonomyCategories
			|| !this.state.selectedEntities || !this.state.selectedEntities) {
			return <Loading height={300} />;
		}

		return (
			<div className={"row"}>
				<div className="col-md-12">
					<h2>Tag</h2>
				</div>
				<div className="col-md-12">
					<div className={"row row-spaced"}>
						<div className="col-md-6">
							<h3>Taxonomy tags</h3>
							{this.state.taxonomyValues && this.state.taxonomyCategories
								? <FormLine
									label={"Add taxonomy value"}
									type={"multiselect"}
									fullWidth={true}
									value={this.state.selectedTaxonomyValues}
									options={this.getTaxonomyValuesForArticles()
										.map((v) => ({ label: v.category + " - " + v.name, value: v.id }))}
									onChange={(v) => this.changeState("selectedTaxonomyValues", v)}
								/>
								: <Loading
									height={150}
								/>
							}
						</div>
						<div className="col-md-6">
							<h3>Entity tags</h3>
							{this.state.entities !== null
								? <FormLine
									label={"Add entity"}
									type={"multiselect"}
									fullWidth={true}
									value={this.state.selectedEntities}
									options={this.state.entities
										.map((v) => ({ label: v.name, value: v.id }))}
									onChange={(v) => this.changeState("selectedEntities", v)}
								/>
								: <Loading
									height={150}
								/>
							}
						</div>
					</div>
				</div>
			</div>
		);
	}
}
