import React from "react";
import "./Tab.css";
import dompurify from "dompurify";

export default class Tab extends React.Component {
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

	getElementClassName(isSelected) {
		if (isSelected) {
			if (this.props.fullWidth) {
				return "Tab-menu-el-fw Tab-menu-el-selected-fw";
			}
			return "Tab-menu-el Tab-menu-el-selected";
		}

		if (this.props.fullWidth) {
			return "Tab-menu-el-fw";
		}

		return "Tab-menu-el";
	}

	render() {
		return (
			<div className="Tab max-sized-page">
				<div className={"row"}>
					<div className={this.props.fullWidth ? "col-md-12" : "col-md-2"}>
						<div className={"row"}>
							<div className="col-md-12">
								<div className={this.props.fullWidth ? "Tab-menu-fw" : "Tab-menu"}>
									{this.props.keys.map((k, i) => {
										if (k === null) {
											return (
												<div
													key={k}
													className={"Tab-menu-el-empty"}
												/>
											);
										}
										return (
											<div
												key={k}
												className={this.getElementClassName(this.state.selectedMenu === k)}
												onClick={() => this.onMenuClick(k)}>
												<div dangerouslySetInnerHTML={{
													__html: dompurify.sanitize(this.props.labels[i]),
												}}/>
											</div>
										);
									})}
								</div>
							</div>
						</div>
					</div>
					<div className={this.props.fullWidth ? "col-md-12 Tab-content-fw" : "col-md-10 Tab-content"}>
						{this.props.keys.indexOf(this.state.selectedMenu) >= 0
							? this.props.content[this.props.keys.indexOf(this.state.selectedMenu)]
							: ""}
					</div>
				</div>
			</div>
		);
	}
}
