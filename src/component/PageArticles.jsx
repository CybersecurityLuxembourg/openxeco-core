import React from "react";
import "./PageArticles.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest } from "../utils/request.jsx";
import { getUrlParameter, dictToURI } from "../utils/url.jsx";
import DynamicTable from "./table/DynamicTable.jsx";
import ArticleHorizontal from "./item/ArticleHorizontal.jsx";
import Message from "./box/Message.jsx";
import Loading from "./box/Loading.jsx";
import DialogAddArticle from "./dialog/DialogAddArticle.jsx";

export default class PageArticles extends React.Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);
		this.getArticleEnums = this.getArticleEnums.bind(this);
		this.getMyArticles = this.getMyArticles.bind(this);

		this.state = {
			articles: null,
			articleEnums: null,

			filters: {
				title: null,
				include_tags: "true",
				per_page: 20,
				page: getUrlParameter("page") !== null ? parseInt(getUrlParameter("page"), 10) : 1,
			},
		};
	}

	componentDidMount() {
		this.refresh();
	}

	componentDidUpdate(prevProps) {
		if (JSON.stringify(prevProps.myCompanies) !== JSON.stringify(this.props.myCompanies)) {
			this.refresh();
		}
	}

	refresh() {
		if (this.props.myCompanies !== null && this.props.myCompanies.length > 0) {
			this.getArticleEnums();
			this.getMyArticles();
		}
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

				{this.props.myCompanies !== null && this.props.myCompanies.length > 0
					&& <div className={"row"}>
						<div className="col-md-12 row-spaced">
							<div className="right-buttons">
								<button
									className="blue-button"
									disabled={true}
								>
									<i className="fas fa-search"/>
								</button>
								<button
									className="blue-button"
									onClick={this.refresh}
								>
									<i className="fas fa-sync-alt"/>
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
											settings={this.props.settings}
											afterDelete={this.refresh}
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
				}

				{this.props.myCompanies !== null && this.props.myCompanies.length === 0
					&& <Message
						text={<div>
							You are not assign to any entity. You need to have access to
							an entity to edit articles on behalf of it.

							Please see the Add or claim an entity page to request for it.
						</div>}
						height={200}
					/>
				}

				{this.props.myCompanies === null
					&& <Loading
						height={200}
					/>
				}
			</div>
		);
	}
}
