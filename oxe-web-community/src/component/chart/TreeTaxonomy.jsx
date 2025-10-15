import React from "react";
import "./TreeTaxonomy.css";
import Tree from "react-d3-tree";
import Loading from "../box/Loading.jsx";

export default class TreeTaxonomy extends React.Component {
	constructor(props) {
		super(props);

		this.getChildCategories = this.getChildCategories.bind(this);
		this.getTreeData = this.getTreeData.bind(this);
		this.fillChildrenRecursively = this.fillChildrenRecursively.bind(this);
		this.getLevelsOfCategory = this.getLevelsOfCategory.bind(this);
		this.onNodeClick = this.onNodeClick.bind(this);

		this.state = {
			activeClick: false,
		};
	}

	getChildCategories() {
		return this.props.categories
			.filter((c) => this.props.categoryHierarchy
				.map((ch) => ch.parent_category).indexOf(c.name) < 0);
	}

	getTreeData() {
		const treeData = {
			name: "",
		};

		// Get levels of tree

		const levels = this.getLevelsOfCategory(this.props.category);

		// Build data structure

		treeData.children = this.fillChildrenRecursively(null, -1, levels);

		return [treeData];
	}

	fillChildrenRecursively(parent, parentLevel, levels) {
		if (parentLevel + 1 >= levels.length) return undefined;

		const childCategory = levels[parentLevel + 1];
		let childValues = this.props.values.filter((v) => v.category === childCategory);

		if (parent !== null) {
			childValues = childValues.filter((v) => this.props.valueHierarchy
				.filter((hv) => hv.parent_value === parent)
				.map((hv) => hv.child_value).indexOf(v.id) >= 0);
		}

		const children = [];

		for (let i = 0; i < childValues.length; i++) {
			const child = {
				child_id: childValues[i].id,
				name: childValues[i].name,
				children: this.fillChildrenRecursively(childValues[i].id, parentLevel + 1, levels),
				leafLevel: levels.length,
			};

			if (parentLevel + 2 === levels.length) {
				let fillColor = null;

				if (this.props.selectedValues === null) {
					fillColor = "lightgrey";
				} else if (this.props.selectedValues
					.filter((a) => a === childValues[i].id).length > 0) {
					fillColor = "#bcebff";
				} else {
					fillColor = "#fed7da";
				}

				child.nodeSvgShape = {
					shape: "circle",
					shapeProps: {
						r: 10,
						fill: fillColor,
					},
				};
			}

			children.push(child);
		}

		return children;
	}

	getLevelsOfCategory(category) {
		let levels = [category];

		while (this.props.categoryHierarchy.map((ch) => ch.child_category).indexOf(levels[0]) >= 0) {
			// eslint-disable-next-line no-loop-func
			const link = this.props.categoryHierarchy.filter((ch) => ch.child_category === levels[0])[0];
			levels = [link.parent_category].concat(levels);
		}

		return levels;
	}

	onNodeClick(info) {
		if (info.children === undefined) {
			const childId = info.child_id;
			let newValues = null;

			const selectedValues = this.props.selectedValues.map((v) => v);
			const matchingSelectedValues = this.props.selectedValues
				.filter((vh) => vh === childId);

			if (matchingSelectedValues.length === 0) {
				newValues = selectedValues.concat([childId]);
			} else {
				newValues = selectedValues.filter((v) => v !== childId);
			}

			this.props.updateSelection(newValues);
		}
	}

	render() {
		if (this.props.selectedValues === null
            || this.props.categories === null
            || this.props.categoryHierarchy === null
            || this.props.values === null
            || this.props.valueHierarchy === null) {
			return (
				<Loading
					height={200}
				/>
			);
		}

		return (
			<div
				className="TreeTaxonomy"
				style={{
					height: 100 + 25 * this.props.values
						.filter((v) => v.category === this.props.category).length,
				}}>

				{!this.state.activeClick
					&& <div className={"TreeTaxonomy-cover"}/>
				}

        <div className={"TreeTaxonomy-button"}>
          <button
            className={"small-button"}
            onClick={() => this.setState({ activeClick: !this.state.activeClick })}
            disabled={this.props.category === "SME PACKAGE"}
          >
            <i className={`fas ${this.state.activeClick ? "fa-lock-open" : "fa-lock"}`} />
          </button>
        </div>

				<Tree
					data={this.getTreeData()}
					zoom={0.8 - (0.05 * (this.getLevelsOfCategory(this.props.category).length - 1))}
					enableLegacyTransition={true}
					transitionDuration={0}
					translate={{
						x: 100,
						y: 50 + (25 * this.props.values
							.filter((v) => v.category === this.props.category).length) / 2,
					}}
					separation={{
						siblings: 0.24,
						nonSiblings: 0.3,
					}}
					nodeSize={{
						y: 140,
						x: 300,
					}}
					textLayout={{
						x: 20,
						y: 0,
					}}
					styles={{
						links: {
							stroke: "lightgrey",
							strokeWidth: 2,
						},
						nodes: {
							node: {
								circle: {
									stroke: "lightgrey",
									fill: "lightgrey",
								},
								name: {
									stroke: "gray",
								},
								attributes: {},
							},
							leafNode: {
								circle: {
									stroke: "lightgrey",
									fill: "lightgrey",
								},
								name: {
									stroke: "gray",
								},
								attributes: {},
							},
						},
					}}
					onClick={(i, e) => this.onNodeClick(i, e)}
					rootNodeClassName="TreeTaxonomy__root"
					branchNodeClassName="TreeTaxonomy__branch"
					leafNodeClassName="TreeTaxonomy__leaf"
				/>
			</div>
		);
	}
}
