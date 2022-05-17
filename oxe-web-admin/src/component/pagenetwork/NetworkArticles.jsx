import React from "react";
import "./NetworkArticles.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, getForeignRequest } from "../../utils/request.jsx";
import Loading from "../box/Loading.jsx";
import Message from "../box/Message.jsx";
import Article from "../item/Article.jsx";
import DynamicTable from "../table/DynamicTable.jsx";

export default class NetworkArticles extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			nodes: null,
			articles: null,
		};
	}

	componentDidMount() {
		this.refresh();
	}

	refresh() {
		this.getNodes();
	}

	getNodes() {
		this.setState({
			nodes: null,
		}, () => {
			getRequest.call(this, "network/get_network_nodes", (data) => {
				this.setState({
					nodes: data,
				}, () => {
					this.fetchArticles();
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		});
	}

	fetchArticles() {
		this.setState({ articles: {} }, () => {
			Promise.all(this.state.nodes.map(this.fetchArticlesFromNode)).then((data) => {
				const articles = {};

				data.forEach((d, i) => {
					articles[this.state.nodes[i].id] = d;
				});

				this.setState({ articles });
			});
		});
	}

	fetchArticlesFromNode(node, page) {
		const p = page || 1;
		const url = node.api_endpoint + "/public/get_public_articles"
			+ "?page=" + p
			+ "&per_page=10";

		return new Promise((resolve) => getForeignRequest(url, (data) => {
			resolve(data);
			this.setState({ loadingProgress: this.state.loadingProgress + 1 });
		}, () => {
			resolve(null);
			this.setState({ loadingProgress: this.state.loadingProgress + 1 });
		}, () => {
			resolve(null);
			this.setState({ loadingProgress: this.state.loadingProgress + 1 });
		}));
	}

	fetchArticlesDynamicallyFromNode(n, p) {
		const node = this.state.nodes.filter((o) => o.id === parseInt(n, 10))[0];

		this.fetchArticlesFromNode(node, p).then((data) => {
			const articles = { ...this.state.articles };

			if (data && this.state.articles) {
				articles[n] = data;
				this.setState({ articles });
			}
		});
	}

	static getColumns(node) {
		return [
			{
				Header: "Article",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<Article
						id={value.id}
						name={value.title}
						node={node}
					/>
				),
				width: 350,
			},
			{
				Header: "TYPE",
				accessor: "type",
				width: 100,
			},
			{
				Header: "Pub. date",
				accessor: "publication_date",
				width: 100,
			},
		];
	}

	// eslint-disable-next-line class-methods-use-this
	render() {
		return (
			<div id="NetworkArticles" className="max-sized-page fade-in">
				<div className={"row"}>
					<div className="col-md-12">
						<h1>Network articles</h1>
					</div>
				</div>

				<div className={"row"}>
					{this.state.articles
						? Object.keys(this.state.articles).map((k) => (
							<div
								className="col-md-12"
								key={k}>
								<h2>{this.state.nodes.filter((n) => n.id === parseInt(k, 10))[0].api_endpoint}</h2>

								<div className={"row"}>
									{this.state.articles[k].items
										? <div className="col-md-12">
											<DynamicTable
												columns={NetworkArticles.getColumns(this.state.nodes
													.filter((n) => n.id === parseInt(k, 10))[0])}
												data={this.state.articles[k].items}
												pagination={this.state.articles[k].pagination}
												changePage={(p) => this.fetchArticlesDynamicallyFromNode(k, p)}
											/>
										</div>
										: <div className="col-md-12">
											<Message
												height={200}
												text="Error while getting the articles"
											/>
										</div>
									}
								</div>
							</div>
						))
						: <div className="col-md-12">
							<Loading
								height={300}
							/>
						</div>
					}
				</div>
			</div>
		);
	}
}
