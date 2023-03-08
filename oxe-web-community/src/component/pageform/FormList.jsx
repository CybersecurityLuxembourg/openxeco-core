import React from "react";
import "./FormList.css";
import Loading from "../box/Loading.jsx";
import Message from "../box/Message.jsx";

export default class FormList extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		return (
			<div className={"FormList max-sized-page row-spaced"}>
				<div className={"row"}>
					<div className="col-md-12">
						<h2>Available forms</h2>
					</div>

					{this.props.forms && this.props.forms.length > 0
						&& this.props.forms.map((f, i) => (
							<div className="col-md-6" key={f.id}>
								<a
									onClick={() => this.props.selectForm(this.props.keys[i])}
								>
									<div className="FormList-white-block">
										<i className="fas fa-poll-h"/>
										<h3>{f.name}</h3>
									</div>
								</a>
							</div>
						))
					}

					{this.props.forms && this.props.forms.length === 0
						&& <Message
							text={"No form available"}
							height={200}
						/>
					}

					{!this.props.forms
						&& <Loading
							height={200}
						/>
					}
				</div>
			</div>
		);
	}
}
