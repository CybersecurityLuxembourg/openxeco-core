import React from "react";
import "./DashboardGraph.css";
import Graph from "react-graph-vis";

export default class DashboardGraph extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	getGraphData() {
		if (!this.props.taxonomy || !this.state.companies) {
			return {};
		}

		const roleNodes = this.props.taxonomy.taxonomy_values
			.filter((v) => v.category === "ECOSYSTEM ROLE")
			.map((v) => ({
				id: v.id,
				label: v.name,
				color: { border: "white", background: "#009fe3" },
				font: { color: "white" },
				shape: "box",
			}));

		const ecosystemRoleValueIds = roleNodes.map((n) => (n.id));

		const companyNodes = this.props.taxonomy.taxonomy_assignments
			.filter((a) => ecosystemRoleValueIds.indexOf(a.taxonomy_value) >= 0)
			.map((a, i) => ({
				id: 1000000 + i,
				label: this.state.companies.filter((c) => c.id === a.company)[0].name,
				company_id: a.company,
				value_id: a.taxonomy_value,
				color: { border: "white", background: "#26282b" },
				font: { color: "white" },
				shape: "box",
			}));

		return {
			nodes: [
				{
					id: -1,
					label: "LUXEMBOURG",
					color: { border: "white", background: "#e40613" },
					font: { color: "white" },
					shape: "box",
				},
				...roleNodes,
				...companyNodes,
			],
			edges: [
				...roleNodes.map((r) => ({ from: -1, to: r.id, color: { color: "white" } })),
				...companyNodes.map((c) => ({ from: c.value_id, to: c.id, color: { color: "white" } })),
			],
		};
	}

	render() {
		const options = {
			layout: {
			},
			edges: {
				color: "#000000",
			},
			height: "500px",
		};

		const events = {
			/* select: function(event) {
				var { nodes, edges } = event;
			} */
		};

		return (
			<div id={"DashboardGraph"}>
				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h1>Network graph</h1>
					</div>

					<Graph
						graph={this.getGraphData()}
						options={options}
						events={events}
					/>
				</div>
			</div>
		);
	}
}
