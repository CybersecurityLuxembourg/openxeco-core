import React from "react";
import "./ArticleList.css";
import { NotificationManager as nm } from "react-notifications";
import Popup from "reactjs-popup";
import Loading from "../box/Loading.jsx";
import Table from "../table/Table.jsx";
import { getRequest, postRequest } from "../../utils/request.jsx";
import Article from "../item/Article.jsx";
import FormLine from "../button/FormLine.jsx";
import TwitterLink from "../button/TwitterLink.jsx";
import LinkedInLink from "../button/LinkedInLink.jsx";
import { dictToURI } from "../../utils/url.jsx";
import DialogArticleFilter from "../dialog/DialogArticleFilter.jsx";

export default class ArticleList extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			articles: null,
			newArticleTitle: "",
			filters: null,
		};
	}

	componentDidMount() {
		this.refresh();
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevState.filters !== this.state.filters) this.refresh();
	}

	refresh() {
		this.setState({
			articles: null,
			loading: true,
		});

		const params = dictToURI(this.state.filters);

		getRequest.call(this, "article/get_articles?" + params, (data) => {
			this.setState({
				articles: data,
				loading: false,
			});
		}, (response) => {
			this.setState({ loading: false });
			nm.warning(response.statusText);
		}, (error) => {
			this.setState({ loading: false });
			nm.error(error.message);
		});
	}

	addArticleFromTitle(close) {
		const params = {
			title: this.state.newArticleTitle,
		};

		postRequest.call(this, "article/add_article", params, () => {
			this.refresh();
			this.setState({ newArticleTitle: "" });
			if (close) {
				close();
			}
			nm.info("The article has been added");
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
				Header: "Title",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<Article
						id={value.id}
						name={value.title}
						afterDeletion={() => this.refresh()}
						onOpen={() => this.props.history.push("/articles/" + value.id)}
						onClose={() => this.props.history.push("/articles")}
						open={value.id.toString() === this.props.match.params.id}
						user={this.props.user}
					/>
				),
				width: 350,
			},
			{
				Header: "Type",
				accessor: "type",
				width: 100,
			},
			{
				Header: "Pub. date",
				accessor: "publication_date",
				width: 100,
			},
			{
				Header: "Status",
				accessor: "status",
				width: 100,
			},
			{
				Header: "Initiator",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					value.is_created_by_admin === 1 ? "ADMIN" : "COMMUNITY"
				),
				width: 100,
			},
			{
				Header: "Publish",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<div>
						<TwitterLink
							text={value.title}
							url={value.link}
						/>
						<LinkedInLink
							text={value.title}
							url={value.link}
						/>
					</div>
				),
				width: 100,
			},
		];

		return (
			<div id="ArticleList" className="max-sized-page">
				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h1>{this.state.articles !== null ? this.state.articles.length : 0} Article{this.state.articles !== null && this.state.articles.length > 1 ? "s" : ""}</h1>
						<div className="top-right-buttons">
							<button
								onClick={() => this.refresh()}>
								<i className="fas fa-redo-alt"/>
							</button>
							<Popup
								trigger={
									<button>
										<i className="fas fa-plus"/>
									</button>
								}
								modal
							>
								{(close) => <div className={"row row-spaced"}>
									<div className={"col-md-9"}>
										<h2>Add a new article</h2>
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
											label={"Article title"}
											value={this.state.newArticleTitle}
											onChange={(v) => this.changeState("newArticleTitle", v)}
										/>
										<div className="right-buttons">
											<button
												onClick={() => this.addArticleFromTitle(close)}
												disabled={this.state.newArticleTitle === null
													|| this.state.newArticleTitle.length < 3}>
												<i className="fas fa-plus"/> Add a new article
											</button>
										</div>
									</div>
								</div>}
							</Popup>
							<DialogArticleFilter
								trigger={
									<button
										className={"blue-background"}
										data-hover="Filter">
										<i className="fas fa-search"/>
									</button>
								}
								applyFilter={(filters) => this.changeState("filters", filters)}
							/>
						</div>
					</div>
					<div className="col-md-12">
						{this.state.articles !== null
							? <Table
								columns={columns}
								data={this.state.articles
									.filter((a) => this.props.match.params.id === undefined
										|| this.props.match.params.id === a.id.toString())}
								showBottomBar={true}
							/>
							: <Loading
								height={500}
							/>
						}
					</div>
				</div>
			</div>
		);
	}
}
