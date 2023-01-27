import React from "react";
import "./TabStep.css";
import dompurify from "dompurify";

export default class TabStep extends React.Component {
	constructor(props) {
		super(props);

		this.onMenuClick = this.onMenuClick.bind(this);

		this.state = {
			selectedMenu: this.props.selectedMenu !== undefined
				&& this.props.keys.indexOf(this.props.selectedMenu) >= 0
				? this.props.selectedMenu : this.props.keys[0],
		};
	}

	componentDidUpdate(prevProps) {
		if (prevProps.selectedMenu !== this.props.selectedMenu
			&& this.props.selectedMenu !== null
			&& this.props.keys.indexOf(this.props.selectedMenu) >= 0) {
			this.setState({ selectedMenu: this.props.selectedMenu });
		}
	}

	onMenuClick(key) {
		if (this.props.onMenuClick) {
			this.props.onMenuClick(key);
		}

		this.setState({ selectedMenu: key });
	}

	render() {
		return (
			<div className="TabStep max-sized-page">
				<div className={"row"}>
					<div className="col-md-12">
						<div className="TabStep-menu">
							{this.props.keys.map((k, i) => {
								if (k === null) {
									return (
										<div
											key={k}
											className={"TabStep-menu-el-empty"}
										/>
									);
								}
								return (
									<div
										key={k}
										className={this.state.selectedMenu === k ? "TabStep-menu-el TabStep-menu-el-selected" : "TabStep-menu-el"}
										onClick={() => this.onMenuClick(k)}>
										<div dangerouslySetInnerHTML={{
											__html: dompurify.sanitize(this.props.labels[i]),
										}}/>
										{this.props.notifications !== undefined
											&& this.props.notifications[i] !== undefined
											&& this.props.notifications[i] > 0
											&& <div className={"TabStep-notification"}>
												{this.props.notifications[i]}
											</div>
										}
									</div>
								);
							})}
						</div>
					</div>
					<div className="col-md-12 TabStep-content">
						{this.props.keys.indexOf(this.state.selectedMenu) >= 0
							? this.props.content[this.props.keys.indexOf(this.state.selectedMenu)]
							: ""}
					</div>
				</div>
			</div>
		);
	}
}
