import React from "react";
import "./PageArticles.css";
import { NotificationManager as nm } from "react-notifications";
import { Link } from "react-router-dom";
import { getRequest } from "../utils/request.jsx";
import { getUrlParameter, dictToURI } from "../utils/url.jsx";
import DynamicTable from "./table/DynamicTable.jsx";
import ArticleHorizontal from "./item/ArticleHorizontal.jsx";
import Message from "./box/Message.jsx";
import Loading from "./box/Loading.jsx";
import DialogAddArticle from "./dialog/DialogAddArticle.jsx";
import DialogHint from "./dialog/DialogHint.jsx";

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
					<div className="col-md-10">
						<h1>My articles</h1>
					</div>

					<div className="col-md-2 PageArticles-hint-wrapper">
						<DialogHint
							content={
								<div className="row">
									<div className="col-md-12">
										<h2>What is an article?</h2>

										<p>
											An article is a global name to define different objects
											as the following ones:
										</p>

										<ul>
											{this.props.settings !== null
												&& this.props.settings.AUTHORIZED_ARTICLE_TYPES_FOR_ECOSYSTEM !== undefined
												&& this.props.settings.AUTHORIZED_ARTICLE_TYPES_FOR_ECOSYSTEM
													.split(",")
													.map((t) => <li
														key={t}>
														{t}
													</li>)}
										</ul>

										<p>
											Each of thoses object are editable with this webpage
											by creating an article.
										</p>

										<p>
											Every article is edited and published on behalf of an entity.
											If you are not assigned to any entities, please see this page.
										</p>

										<h2>How can I create an article</h2>

										<p>
											To create an article, you can select this button
											that is on the current webpage.
										</p>

										<img src="img/hint-create-article-button.png"/>

										<p>
											Then, you will find a dialog box to choose the title
											and the company that will be marked as an editor of the article.
											The title must be at least 6 characters long.
										</p>

										<img src="img/hint-create-article-form.png"/>

										<p>
											To finish, you can select the &quot;Add article&quot; button.
											The new article will be visible on the list of the page.
										</p>

										<h2>What is the information shown?</h2>

										<img src="img/hint-article-display.png"/>

										<ul>
											<li>1. The title of the article</li>
											<li>2. The company assigned to the article</li>
											<li>
												3. The status of the article. To have more
												information about the OFFLINE status, you can
												click on this button and get the reasons why
												the article is offline
											</li>
											<li>4. The abstract of the article</li>
											<li>5. The publication date of the article</li>
											<li>6. The button to reach the editor mode of the article</li>
										</ul>

										<h2>How can I edit an article?</h2>

										<p>
											You can edit any article you can see by clicking on the
											according &quot;Open editor&quot; button:
										</p>

										<img src="img/hint-open-editor.png"/>
									</div>
								</div>
							}
						/>
					</div>
				</div>

				{this.props.myCompanies !== null && this.props.myCompanies.length > 0
					&& <div className={"row"}>
						<div className="col-md-12 row-spaced">
							<div className="right-buttons">
								<button
									className="blue-button"
									onClick={this.refresh}
								>
									<i className="fas fa-sync-alt"/>
								</button>
								<DialogAddArticle
									trigger={<button
										className="blue-button"
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
							<p>
								You are not assign to any entity. You need to have access to
								an entity to edit articles and publish on behalf of it.
							</p>
							<p>
								Please see the
								<a
									onClick={() => this.props.changeMenu("add_company")}
								>
									<Link to="/add_company">&#32;Add or claim an entity&#32;</Link>
								</a>
								page to request for it.
							</p>
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
