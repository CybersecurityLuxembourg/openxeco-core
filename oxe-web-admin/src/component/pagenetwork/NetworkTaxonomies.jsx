import React from "react";
import "./NetworkTaxonomies.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, getForeignRequest } from "../../utils/request.jsx";
import Loading from "../box/Loading.jsx";
import Message from "../box/Message.jsx";
import Taxonomy from "../item/Taxonomy.jsx";

export default class NetworkTaxonomies extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			nodes: null,
			taxonomies: null,
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
					this.fetchTaxonomies();
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		});
	}

	fetchTaxonomies() {
		this.setState({ taxonomies: {} }, () => {
			Promise.all(this.state.nodes.map(this.fetchTaxonomiesFromNode)).then((data) => {
				const taxonomies = {};

				data.forEach((d, i) => {
					taxonomies[this.state.nodes[i].id] = d;
				});

				this.setState({ taxonomies });
			});
		});
	}

	fetchTaxonomiesFromNode(node) {
		const url = node.api_endpoint + "/public/get_public_taxonomy";

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

	// eslint-disable-next-line class-methods-use-this
	render() {
		return (
			<div id="NetworkTaxonomies" className="max-sized-page fade-in">
				<div className={"row"}>
					<div className="col-md-12">
						<h1>Network taxonomies</h1>
					</div>
				</div>

				<div className={"row"}>
					{this.state.taxonomies
						? Object.keys(this.state.taxonomies).map((k) => (
							<div
								className="col-md-12"
								key={k}>
								<h2>{this.state.nodes.filter((n) => n.id === parseInt(k, 10))[0].api_endpoint}</h2>

								<div className={"row"}>
									{this.state.taxonomies[k].categories
										? this.state.taxonomies[k].categories.map((t) => (
											<div className="col-md-4" key={k + "-" + t.name}>
												<Taxonomy
													name={t.name}
													node={this.state.nodes.filter((n) => n.id === parseInt(k, 10))[0]}
												/>
											</div>
										))
										: <div className="col-md-12">
											<Message
												height={200}
												text="Error while setting the taxonomies"
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
