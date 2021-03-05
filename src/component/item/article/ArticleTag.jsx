import React from "react";
import "./ArticleTag.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, postRequest } from "../../../utils/request";
import FormLine from "../../button/FormLine";
import Loading from "../../box/Loading";

export default class ArticleTag extends React.Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);
		this.addTaxonomyTag = this.addTaxonomyTag.bind(this);
		this.addCompanyTag = this.addCompanyTag.bind(this);
		this.deleteTaxonomyTag = this.deleteTaxonomyTag.bind(this);
		this.deleteCompanyTag = this.deleteCompanyTag.bind(this);
		this.changeState = this.changeState.bind(this);

		this.state = {
			companies: null,
			taxonomyValues: null,
			selectedCompanies: null,
			selectedTaxonomyValues: null,
		};
	}

	componentDidMount() {
		this.refresh();
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		if (prevState.selectedCompanies !== this.state.selectedCompanies
            && prevState.selectedCompanies !== null && this.state.selectedCompanies !== null) {
			if (prevState.selectedCompanies.length > this.state.selectedCompanies.length) {
				const removedEl = prevState.selectedCompanies.filter((x) => !this.state.selectedCompanies.includes(x));
				this.deleteCompanyTag(removedEl[0]);
			} else {
				const removedEl = this.state.selectedCompanies.filter((x) => !prevState.selectedCompanies.includes(x));
				this.addCompanyTag(removedEl[0]);
			}
		}

		if (prevState.selectedTaxonomyValues !== this.state.selectedTaxonomyValues
            && prevState.selectedTaxonomyValues !== null && this.state.selectedTaxonomyValues !== null) {
			if (prevState.selectedTaxonomyValues.length > this.state.selectedTaxonomyValues.length) {
				const removedEl = prevState.selectedTaxonomyValues.filter((x) => !this.state.selectedTaxonomyValues.includes(x));
				this.deleteTaxonomyTag(removedEl[0]);
			} else {
				const removedEl = this.state.selectedTaxonomyValues.filter((x) => !prevState.selectedTaxonomyValues.includes(x));
				this.addTaxonomyTag(removedEl[0]);
			}
		}
	}

	refresh() {
		this.setState({
			companies: null,
			taxonomyValues: null,
			selectedCompanies: null,
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

		getRequest.call(this, "company/get_companies", (data) => {
			this.setState({
				companies: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "article/get_article_tags/" + this.props.id, (data) => {
			this.setState({
				selectedCompanies: data.company_tags.map((t) => t.id),
				selectedTaxonomyValues: data.taxonomy_tags.map((t) => t.id),
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	addTaxonomyTag(taxonomy_value_id) {
		const params = {
			article: this.props.id,
			taxonomy_value: taxonomy_value_id,
		};

		postRequest.call(this, "article/add_taxonomy_tag", params, (data) => {
			this.refresh();
		}, (response) => {
			this.refresh();
			nm.warning(response.statusText);
		}, (error) => {
			this.refresh();
			nm.error(error.message);
		});
	}

	addCompanyTag(company_id) {
		const params = {
			article: this.props.id,
			company: company_id,
		};

		postRequest.call(this, "article/add_company_tag", params, (data) => {
			this.refresh();
		}, (response) => {
			this.refresh();
			nm.warning(response.statusText);
		}, (error) => {
			this.refresh();
			nm.error(error.message);
		});
	}

	deleteTaxonomyTag(taxonomy_value_id) {
		const params = {
			article: this.props.id,
			taxonomy_value: taxonomy_value_id,
		};

		postRequest.call(this, "article/delete_taxonomy_tag", params, (data) => {
			this.refresh();
		}, (response) => {
			this.refresh();
			nm.warning(response.statusText);
		}, (error) => {
			this.refresh();
			nm.error(error.message);
		});
	}

	deleteCompanyTag(company_id) {
		const params = {
			article: this.props.id,
			company: company_id,
		};

		postRequest.call(this, "article/delete_company_tag", params, (data) => {
			this.refresh();
		}, (response) => {
			this.refresh();
			nm.warning(response.statusText);
		}, (error) => {
			this.refresh();
			nm.error(error.message);
		});
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		if (this.state.article === null) return <Loading height={300}/>;

		return (
			<div className={"row"}>
				<div className="col-md-12">
					<h2>Tag</h2>
				</div>
				<div className="col-md-12">
					<div className={"row row-spaced"}>
						<div className="col-md-6">
							<h3>Taxonomy tags</h3>
							{this.state.taxonomyValues !== null
								? <FormLine
									label={"Add taxonomy value"}
									type={"multiselect"}
									fullWidth={true}
									value={this.state.selectedTaxonomyValues}
									options={this.state.taxonomyValues
										.map((v) => ({ label: v.category + " - " + v.name, value: v.id }))}
									onChange={(v) => this.changeState("selectedTaxonomyValues", v)}
								/>
								: <Loading
									height={150}
								/>
							}
						</div>
						<div className="col-md-6">
							<h3>Company tags</h3>
							{this.state.companies !== null
								? <FormLine
									label={"Add company"}
									type={"multiselect"}
									fullWidth={true}
									value={this.state.selectedCompanies}
									options={this.state.companies
										.map((v) => ({ label: v.name, value: v.id }))}
									onChange={(v) => this.changeState("selectedCompanies", v)}
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
