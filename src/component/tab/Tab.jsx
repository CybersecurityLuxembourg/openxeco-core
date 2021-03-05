import React from "react";
import "./Tab.css";

export default class Tab extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedMenu: this.props.menu[0],
		};
	}

	render() {
		return (
			<div className="Tab max-sized-page">
				<div className={"row"}>
					<div className="col-md-2">
						<div className={"row"}>
							<div className="col-md-2">
								<div className="Tab-menu">
									{this.props.menu.map((m) => (
										<div
											className={"Tab-menu-el "
													+ (this.state.selectedMenu === m ? "Tab-menu-el-selected" : "")}
											onClick={() => this.setState({ selectedMenu: m })}>
											{m}
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
					<div className="col-md-10 Tab-content">
						{this.props.menu.indexOf(this.state.selectedMenu) >= 0
							? this.props.content[this.props.menu.indexOf(this.state.selectedMenu)]
							: ""}
					</div>
				</div>
			</div>
		);
	}
}
