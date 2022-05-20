import React from "react";
import "./ArticleSync.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest } from "../../../utils/request.jsx";
import FormLine from "../../button/FormLine.jsx";
import Loading from "../../box/Loading.jsx";
import Message from "../../box/Message.jsx";
import Info from "../../box/Info.jsx";

export default class ArticleSync extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			nodes: null,
		};
	}

	componentDidMount() {
		this.getNodes();
	}

	componentDidUpdate(prevProps) {
		if (prevProps.article !== this.props.article
			&& !this.state.nodes) {
			this.getNodes();
		}
	}

	getNodes() {
		if (this.props.article && this.props.article.sync_node) {
			this.setState({
				nodes: null,
			}, () => {
				getRequest.call(this, "network/get_network_nodes", (data) => {
					this.setState({
						nodes: data,
					});
				}, (response) => {
					nm.warning(response.statusText);
				}, (error) => {
					nm.error(error.message);
				});
			});
		}
	}

	getNodeEndpoint() {
		if (this.props.article && this.state.nodes) {
			const nodes = this.state.nodes
				.filter((c) => c.id === parseInt(this.props.article.sync_node, 10));

			if (nodes.length > 0) {
				return nodes[0];
			}

			return null;
		}

		return null;
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

		return (
			<div id="ArticleSync" className={"row"}>
				<div className="col-md-12">
					<h2>Synchronization</h2>
				</div>

				<div className="col-md-12">
					{this.props.article
						? <div className="row">
							{!this.props.article.sync_node
								&& <div className="col-md-12">
									<Info
										content={"This article is not synchonized to any source"}
									/>
								</div>
							}

							<div className="col-md-12">
								<FormLine
									label={"Synchronization status"}
									value={this.props.article.sync_status}
									disabled={!this.props.editable || true}
								/>
								<FormLine
									label={"Network node"}
									value={this.getNodeEndpoint() ? this.getNodeEndpoint().api_endpoint : ""}
									disabled={!this.props.editable || true}
								/>
								<FormLine
									label={"Article ID"}
									value={this.props.article.sync_id}
									disabled={!this.props.editable || true}
								/>
								<FormLine
									type="checkbox"
									label={"Synchronize global information"}
									value={this.props.article.sync_global}
									disabled={!this.props.editable || !this.props.article.sync_node}
									onChange={(v) => this.updateCategory("sync_global", v)}
								/>
								<FormLine
									type="checkbox"
									label={"Synchronize content"}
									value={this.props.article.sync_content}
									disabled={!this.props.editable || !this.props.article.sync_node}
									onChange={(v) => this.updateCategory("sync_content", v)}
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
