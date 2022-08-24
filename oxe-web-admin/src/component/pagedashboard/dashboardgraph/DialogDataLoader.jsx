import React from "react";
import "./DialogDataLoader.css";
import Popup from "reactjs-popup";
import FormLine from "../../button/FormLine.jsx";

export default class DialogDataLoader extends React.Component {
	constructor(props) {
		super(props);

		this.state = {};
	}

	render() {
		return (
			<Popup
				trigger={
					<div className={"DialogDataLoader-button"}>
						{this.props.trigger}
					</div>
				}
				modal
				closeOnDocumentClick
				className={"slide-in DialogDataLoader"}
			>
				{(close) => <div className={"DialogDataLoader-form"}>
					<div className="row">
						<div className="col-md-12">
							<h2>Load data</h2>
						</div>

						<div className="col-md-10">
							<FormLine
								label="ENTITIES"
								value={"ALL LOADED"}
								disabled={true}
							/>
						</div>

						<div className="col-md-10">
							<FormLine
								label="TAXONOMIES"
								value={"ALL LOADED"}
								disabled={true}
							/>
						</div>
					</div>

					{this.props.parentState.articleEnums
						&& this.props.parentState.articleEnums.type
						&& this.props.parentState.articleEnums.type.map((t) => (
							<div className="row" key={t}>
								<div className="col-md-10">
									<FormLine
										label={"ARTICLE: " + t}
										value={this.props.parentState[t]
											? `${this.props.parentState[t].length} / ${this.props.parentState[t][0].pagination.pages}`
											: "No data"
										}
										disabled={true}
									/>
								</div>
								<div className="col-md-2">
									<button
										disabled={this.props.parentState[t].length === 0
											|| this.props.parentState[t][0].pagination.pages
											=== this.props.parentState[t].length}
										onClick={() => this.props.getArticles(t, this.props.parentState[t].length + 1)}>
										<span><i className="fas fa-plus-circle"/></span>
									</button>
								</div>
							</div>
						))
					}

					<div className="row">
						<div className="col-md-10">
							<FormLine
								label="USERS"
								value={this.props.parentState.users
									? `${this.props.parentState.users.length} / ${this.props.parentState.users[0].pagination.pages}`
									: "No data"
								}
								disabled={true}
							/>
						</div>
						<div className="col-md-2">
							<button
								className={"grey-background"}
								disabled={this.props.parentState.users.length === 0
									|| this.props.parentState.users[0].pagination.pages
									=== this.props.parentState.users.length}
								onClick={() => this.props.getUsers(this.props.parentState.users.length + 1)}>
								<span><i className="fas fa-plus-circle"/></span>
							</button>
						</div>
					</div>

					<div className={"bottom-right-buttons"}>
						<button
							className={"grey-background"}
							data-hover="Close"
							data-active=""
							onClick={close}>
							<span><i className="far fa-times-circle"/> Close</span>
						</button>
					</div>
				</div>}
			</Popup>
		);
	}
}
