import React from "react";
import "./CompanySync.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest } from "../../../utils/request.jsx";
import FormLine from "../../button/FormLine.jsx";
import Loading from "../../box/Loading.jsx";
import Info from "../../box/Info.jsx";
import { getCategory } from "../../../utils/taxonomy.jsx";

export default class CompanySync extends React.Component {
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
		if (prevProps.company !== this.props.company
			&& prevProps.name !== this.props.name
			&& !this.state.nodes) {
			this.getNodes();
		}
	}

	getNodes() {
		if (this.props.company
			&& this.props.name
			&& getCategory(this.props.company, this.props.name).sync_node) {
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
		if (this.props.company
			&& getCategory(this.props.company, this.props.name)
			&& getCategory(this.props.company, this.props.name).sync_node
			&& this.state.nodes) {
			const nodes = this.state.nodes
				.filter((c) => c.id
					=== parseInt(getCategory(this.props.company, this.props.name).sync_node, 10));

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
		return (
			<div id="CompanySync" className={"row"}>
				<div className="col-md-12">
					<h2>Synchronization</h2>
				</div>

				<div className="col-md-12">
					{this.props.company
						&& getCategory(this.props.company, this.props.name)
						? <div className="row">
							{!getCategory(this.props.company, this.props.name).sync_node
								&& <div className="col-md-12">
									<Info
										content={"This entity is not synchonized to any source"}
									/>
								</div>
							}

							<div className="col-md-12">
								<FormLine
									label={"Synchronization status"}
									value={getCategory(this.props.company, this.props.name).sync_status}
									disabled={!this.props.editable || true}
								/>
								<FormLine
									label={"Network node"}
									value={this.getNodeEndpoint() ? this.getNodeEndpoint().api_endpoint : ""}
									disabled={!this.props.editable || true}
								/>
								<FormLine
									type="checkbox"
									label={"Synchronize global information"}
									value={getCategory(this.props.company, this.props.name).sync_global}
									disabled={!this.props.editable
										|| !getCategory(this.props.company, this.props.name).sync_node}
									onChange={(v) => this.updateCategory("sync_global", v)}
								/>
								<FormLine
									type="checkbox"
									label={"Synchronize addresses"}
									value={getCategory(this.props.company, this.props.name).sync_address}
									disabled={!this.props.editable
										|| !getCategory(this.props.company, this.props.name).sync_node}
									onChange={(v) => this.updateCategory("sync_address", v)}
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
