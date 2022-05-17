import React from "react";
import "./NetworkEntities.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, getForeignRequest } from "../../utils/request.jsx";
import Loading from "../box/Loading.jsx";
import Message from "../box/Message.jsx";
import Company from "../item/Company.jsx";
import Table from "../table/Table.jsx";

export default class NetworkEntities extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			nodes: null,
			entities: null,
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
					this.fetchEntities();
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		});
	}

	fetchEntities() {
		this.setState({ entities: {} }, () => {
			Promise.all(this.state.nodes.map(this.fetchEntitiesFromNode)).then((data) => {
				const entities = {};

				data.forEach((d, i) => {
					entities[this.state.nodes[i].id] = d;
				});

				this.setState({ entities });
			});
		});
	}

	fetchEntitiesFromNode(node) {
		const url = node.api_endpoint + "/public/get_public_companies";

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

	fetchEntitiesDynamicallyFromNode(n) {
		const node = this.state.nodes.filter((o) => o.id === parseInt(n, 10))[0];

		this.fetchEntitiesFromNode(node).then((data) => {
			const entities = { ...this.state.entities };

			if (data && this.state.entities) {
				entities[n] = data;
				this.setState({ entities });
			}
		});
	}

	static getColumns(node) {
		return [
			{
				Header: "Entity",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<Company
						id={value.id}
						name={value.name}
						node={node}
					/>
				),
				width: 350,
			},
			{
				Header: "Trade register number",
				accessor: "trade_register_number",
			},
		];
	}

	// eslint-disable-next-line class-methods-use-this
	render() {
		return (
			<div id="NetworkEntities" className="max-sized-page fade-in">
				<div className={"row"}>
					<div className="col-md-12">
						<h1>Network entities</h1>
					</div>
				</div>

				<div className={"row"}>
					{this.state.entities
						? Object.keys(this.state.entities).map((k) => (
							<div
								className="col-md-12"
								key={k}>
								<h2>{this.state.nodes.filter((n) => n.id === parseInt(k, 10))[0].api_endpoint}</h2>

								<div className={"row"}>
									{this.state.entities[k]
										? <div className="col-md-12">
											<Table
												columns={NetworkEntities.getColumns(this.state.nodes
													.filter((n) => n.id === parseInt(k, 10))[0])}
												data={this.state.entities[k]}
											/>
										</div>
										: <div className="col-md-12">
											<Message
												height={200}
												text="Error while getting the entities"
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
