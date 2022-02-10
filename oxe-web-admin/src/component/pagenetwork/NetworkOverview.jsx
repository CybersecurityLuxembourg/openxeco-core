import React from "react";
import "./NetworkOverview.css";
import createEngine, { DefaultNodeModel, DiagramModel } from "@projectstorm/react-diagrams";
import { CanvasWidget } from "@projectstorm/react-canvas-core";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, postRequest, getForeignRequest } from "../../utils/request.jsx";
import { validateUrl } from "../../utils/re.jsx";
import DialogConfirmation from "../dialog/DialogConfirmation.jsx";
import Table from "../table/Table.jsx";
import FormLine from "../button/FormLine.jsx";
import Loading from "../box/Loading.jsx";

export default class NetworkOverview extends React.Component {
	constructor(props) {
		super(props);

		this.addNode = this.addNode.bind(this);
		this.getNodes = this.getNodes.bind(this);
		this.fetchNodes = this.fetchNodes.bind(this);
		this.fetchNode = this.fetchNode.bind(this);

		this.state = {
			nodes: null,
			apiEndpointValue: "",
			nodeInformation: {},
			engine: null,
			loadingProgress: null,
		};
	}

	componentDidMount() {
		this.refresh();

		const model = new DiagramModel();
		const engine = createEngine();
		engine.setModel(model);
		this.setState({ engine }, () => {
			this.buildDiagram();
		});
	}

	componentDidUpdate(_, prevState) {
		if (prevState.nodeInformation !== this.state.nodeInformation) {
			this.buildDiagram();
		}
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
					this.fetchNodes();
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		});
	}

	addNode() {
		const params = {
			api_endpoint: this.state.apiEndpointValue,
		};

		postRequest.call(this, "network/add_network_node", params, () => {
			this.refresh();
			this.setState({
				apiEndpointValue: "",
			});
			nm.info("The node has been added");
		}, (response) => {
			this.refresh();
			nm.warning(response.statusText);
		}, (error) => {
			this.refresh();
			nm.error(error.message);
		});
	}

	deleteNode(id) {
		const params = {
			id,
		};

		postRequest.call(this, "network/delete_network_node", params, () => {
			this.refresh();
			nm.info("The node has been deleted");
		}, (response) => {
			this.refresh();
			nm.warning(response.statusText);
		}, (error) => {
			this.refresh();
			nm.error(error.message);
		});
	}

	fetchNodes() {
		this.setState({ nodeInformation: {} }, () => {
			Promise.all(this.state.nodes.map(this.fetchNode)).then((data) => {
				const nodeInformation = {};

				data.forEach((d, i) => {
					nodeInformation[this.state.nodes[i].api_endpoint] = d;
				});

				this.setState({ nodeInformation });
			});
		});
	}

	fetchNode(node) {
		const url = node.api_endpoint + "/network/get_node_information";

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

	buildDiagram() {
		const canvas = document.getElementById("NetworkOverview-canvas-wrapper");
		const centerX = canvas.offsetWidth / 2;
		const centerY = 400 / 2;

		const nodes = [];

		const node1 = new DefaultNodeModel({
			name: "My node",
			color: "#bcebff",
		});
		node1.setPosition(centerX, centerY);
		node1.setLocked(true);
		const port1 = node1.addOutPort("Out");
		nodes.push(node1);

		Object.keys(this.state.nodeInformation).forEach((n, i) => {
			const angle = Object.keys(this.state.nodeInformation).length * i;
			const x = centerX + Math.cos(angle) * 150;
			const y = centerY + Math.sin(angle) * 150;

			if (this.state.nodeInformation[n] !== null) {
				const node2 = new DefaultNodeModel({
					name: this.state.nodeInformation[n].project_name,
					color: "#bcebff",
				});
				node2.setPosition(x, y);
				node2.setLocked(true);
				nodes.push(node2);
				const port2 = node2.addOutPort("Out");
				const link = port1.link(port2);
				link.setColor("#ffffff");
				link.setLocked(true);
				nodes.push(link);
			} else {
				const node2 = new DefaultNodeModel({
					name: n,
					color: "#dddddd",
				});
				node2.setPosition(x, y);
				node2.setLocked(true);
				nodes.push(node2);
				const port2 = node2.addOutPort("Out");
				const link = port1.link(port2);
				link.setColor("lightgrey");
				link.setLocked(true);
				nodes.push(link);
			}
		});

		const model = new DiagramModel();

		nodes.forEach((n) => {
			model.addAll(n);
		});

		this.state.engine.setModel(model);

		return null;
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		const nodeColumns = [
			{
				Header: "API endpoint",
				accessor: "api_endpoint",
			},
			{
				Header: " ",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<DialogConfirmation
						text={"Are you sure you want to delete this node?"}
						trigger={
							<button
								className={"small-button red-background Table-right-button"}>
								<i className="fas fa-trash-alt"/>
							</button>
						}
						afterConfirmation={() => this.deleteNode(value.id)}
					/>
				),
				width: 50,
			},
		];

		return (
			<div id="NetworkOverview" className="max-sized-page fade-in">
				<div className={"row"}>
					<div className="col-md-12">
						<h1>Overview</h1>
						<div className="top-right-buttons">
							<button
								onClick={() => this.refresh()}>
								<i className="fas fa-redo-alt"/>
							</button>
						</div>
					</div>
				</div>

				<div className={"row"}>
					<div className="col-md-12">
						<h2>Network representation</h2>
					</div>

					<div id="NetworkOverview-canvas-wrapper" className="col-md-12">
						{this.state.engine
							? <CanvasWidget
								className="NetworkOverview-canvas"
								engine={this.state.engine}
							/>
							: <Loading
								height={500}
							/>
						}
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h2>Network node list</h2>
					</div>

					<div className="col-xl-12 row-spaced">
						<FormLine
							label={"API endpoint of the node"}
							value={this.state.apiEndpointValue}
							onChange={(v) => this.changeState("apiEndpointValue", v)}
						/>
						<div className="right-buttons">
							<button
								className={"blue-background"}
								onClick={this.addNode}
								disabled={!validateUrl(this.state.apiEndpointValue)}>
								<i className="fas fa-plus"/> Add node
							</button>
						</div>
					</div>

					<div className="col-xl-12">
						{this.state.nodes
							? <Table
								keyBase={"Nodes"}
								columns={nodeColumns}
								data={this.state.nodes}
							/>
							: <Loading
								height={200}
							/>
						}
					</div>
				</div>
			</div>
		);
	}
}
