import React from "react";
import "./PageArticles.css";
import { NotificationManager as nm } from "react-notifications";
import Loading from "./box/Loading.jsx";
import { getRequest } from "../utils/request.jsx";
import { getUrlParameter, dictToURI } from "../utils/url.jsx";
import DynamicTable from "./table/DynamicTable.jsx";
import ArticleHorizontal from "./item/ArticleHorizontal.jsx";
import Message from "./box/Message.jsx";
import DialogAddArticle from "./dialog/DialogAddArticle.jsx";

export default class PageArticles extends React.Component {
	constructor(props) {
		super(props);

		this.getArticleEnums = this.getArticleEnums.bind(this);
		this.getMyArticles = this.getMyArticles.bind(this);

		this.state = {
			articles: null,
			articleEnums: null,

			filters: {
				type: "NEWS",
				title: null,
				include_tags: "true",
				per_page: 20,
				page: getUrlParameter("page") !== null ? parseInt(getUrlParameter("page"), 10) : 1,
			},
		};
	}

	componentDidMount() {
		this.getArticleEnums();
		this.getMyArticles();
	}

	getArticleEnums() {
		getRequest.call(this, "public/get_article_enums", (data) => {
			this.setState({
				articleEnums: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getMyArticles(page) {
		this.setState({
			articles: null,
			page: Number.isInteger(page) ? page : this.state.filters.page,
		});

		const params = dictToURI({
			...this.state.filters,
			page: Number.isInteger(page) ? page : this.state.filters.page,
		});

		const urlParams = dictToURI({
			taxonomy_values: this.state.filters.taxonomy_values,
			page: Number.isInteger(page) ? page : this.state.filters.page,
		});

		// eslint-disable-next-line no-restricted-globals
		history.replaceState(null, null, "?" + urlParams);

		getRequest.call(this, "private/get_my_articles?" + params, (data) => {
			this.setState({
				articles: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	render() {
		return (
			<div className={"PageArticles page max-sized-page"}>
				<div className={"row"}>
					<div className="col-md-12">
						<h1>My articles</h1>
					</div>
				</div>

				<div className={"row"}>
					<div className="col-md-6 PageArticles-legend">
						<span className="dot red-dot"></span> Published articles
						<span className="dot blue-dot"></span> Hidden articles
					</div>
					<div className="col-md-6">
						<div className="right-buttons">
							<button
								className="blue-button"
								disabled={true}
							>
								<i className="fas fa-search"/>
							</button>
							<DialogAddArticle
								trigger={<button
									className="blue-button"
									onClick={this.login}
								>
									<i className="fas fa-plus"/> <i className="fas fa-feather-alt"/>
								</button>}
								myCompanies={this.props.myCompanies}
								afterConfirmation={this.getMyArticles}
							/>
						</div>
					</div>
				</div>

				<div className={"row"}>
					<div className="col-md-12">
						{this.state.articles !== null && this.state.articles.pagination
							&& this.state.articles.pagination.total === 0
							&& <div className="row row-spaced">
								<div className="col-md-12">
									<Message
										text={"No article found"}
										height={200}
									/>
								</div>
							</div>
						}

						{this.state.articles !== null && this.state.articles.pagination
							&& this.state.articles.pagination.total > 0
							&& <DynamicTable
								items={this.state.articles.items}
								pagination={this.state.articles.pagination}
								changePage={(page) => this.getArticles(page)}
								buildElement={(a) => <div className="col-md-12">
									<ArticleHorizontal
										info={a}
										analytics={this.props.analytics}
										myCompanies={this.props.myCompanies}
									/>
								</div>
								}
							/>
						}

						{(this.state.articles === null
							|| this.state.articles.pagination === undefined
							|| this.state.articles.items === undefined)
							&& <div className="row row-spaced">
								<div className="col-md-12">
									<Loading
										height={200}
									/>
								</div>
							</div>
						}
					</div>
				</div>
			</div>
		);
	}
}
