import React from "react";
import "./NetworkTaxonomies.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, getForeignRequest } from "../../utils/request.jsx";
import Loading from "../box/Loading.jsx";
import Message from "../box/Message.jsx";
import Taxonomy from "../item/Taxonomy.jsx";
import Table from "../table/Table.jsx";

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

	static getColumns(node) {
		return [
			{
				Header: "Taxonomy",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<Taxonomy
						name={value.name}
						node={node}
					/>
				),
			},
		];
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

				<div className={"row row-spaced"}>
					{this.state.taxonomies
						? Object.keys(this.state.taxonomies).map((k) => (
							<div
								className="col-md-12"
								key={k}>
								<h2>{this.state.nodes.filter((n) => n.id === parseInt(k, 10))[0].api_endpoint}</h2>

								<div className={"row"}>
									{this.state.taxonomies[k].categories
										? <div className="col-md-12">
											<Table
												columns={NetworkTaxonomies.getColumns(this.state.nodes
													.filter((n) => n.id === parseInt(k, 10))[0])}
												data={this.state.taxonomies[k].categories}
											/>
										</div>
										: <div className="col-md-12">
											<Message
												height={200}
												text="Error while getting the taxonomies"
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
