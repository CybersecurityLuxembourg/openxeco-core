import React from 'react';
import './ArticleVersion.css';
import {NotificationManager as nm} from 'react-notifications';
import {getRequest, postRequest} from '../../../utils/request';
import FormLine from '../../button/FormLine';
import Loading from '../../box/Loading';
import Table from '../../table/Table';
import DialogConfirmation from '../../dialog/DialogConfirmation';
import DialogConfirmationWithTextField from '../../dialog/DialogConfirmationWithTextField';


export default class ArticleVersion extends React.Component {

	constructor(props){
		super(props);

		this.refresh = this.refresh.bind(this);
        this.copyArticleVersion = this.copyArticleVersion.bind(this);
		this.deleteArticleVersion = this.deleteArticleVersion.bind(this);
        this.addArticleVersion = this.addArticleVersion.bind(this);
        this.setArticleVersionAsMain = this.setArticleVersionAsMain.bind(this);
        this.changeState = this.changeState.bind(this);

		this.state = {
			versions: null,
            newVersionName: null,
		}
	}

	componentDidMount() {
		this.refresh();
	}

    refresh() {
        getRequest.call(this, "article/get_article_versions/" + this.props.id, data => {
            this.setState({
                versions: data,
            });
        }, response => {
            nm.warning(response.statusText);
        }, error => {
            nm.error(error.message);
        });
    }

    copyArticleVersion(id, name) {
        let params = {
            article_version_id: id,
            name: name
        }

        postRequest.call(this, "article/copy_article_version", params, response => {
            this.refresh();
            nm.info("The version has been copied");
        }, response => {
            this.refresh();
            nm.warning(response.statusText);
        }, error => {
            this.refresh();
            nm.error(error.message);
        });
    }

    deleteArticleVersion(id) {
        let params = {
            id: id,
        }

        postRequest.call(this, "article/delete_article_version", params, response => {
            this.refresh();
            nm.info("The version has been deleted");
        }, response => {
            this.refresh();
            nm.warning(response.statusText);
        }, error => {
            this.refresh();
            nm.error(error.message);
        });
    }

    setArticleVersionAsMain(id) {
        let params = {
            id: id,
        }

        postRequest.call(this, "article/set_article_version_as_main", params, response => {
            this.refresh();
            nm.info("The version has been set as main");
        }, response => {
            this.refresh();
            nm.warning(response.statusText);
        }, error => {
            this.refresh();
            nm.error(error.message);
        });
    }

    addArticleVersion() {
        let params = {
            article_id: this.props.id,
            name: this.state.newVersionName
        }

        postRequest.call(this, "article/add_article_version", params, response => {
            this.refresh();
            nm.info("The version has been added");
        }, response => {
            this.refresh();
            nm.warning(response.statusText);
        }, error => {
            this.refresh();
            nm.error(error.message);
        });
    }

    changeState(field, value) {
        this.setState({[field]: value});
    }

	render() {
		if (this.state.versions === null)
        	return <Loading height={300}/>;

        let columns = [
            {
                Header: 'Name',
                accessor: 'name',
            },
            {
                Header: 'Main',
                accessor: x => { return x },
                Cell: ({ cell: { value } }) => (
                    value.is_main === 1 ?
                        <div>
                            <i className="far fa-star"/>
                        </div>
                    : ""
                ),
                width: 50,
                maxWidth: 50,
            },
            {
                Header: ' ',
                accessor: x => { return x },
                Cell: ({ cell: { value } }) => (
                    <div>
                        <DialogConfirmation
                            text={"Are you sure you want to delete this version?"}
                            trigger={
                                <button
                                    className={"small-button red-background Table-right-button"}
                                    disabled={value.is_main === 1}>
                                    <i className="fas fa-trash-alt"/>
                                </button>
                            }
                            afterConfirmation={() => this.deleteArticleVersion(value.id)}
                        />
                        <DialogConfirmationWithTextField
                            fieldName={"Version name"}
                            text={"Choose a name for the new version:"}
                            trigger={
                                <button
                                    className={"small-button Table-right-button"}>
                                    <i className="far fa-copy"/>
                                </button>
                            }
                            afterConfirmation={(newName) => this.copyArticleVersion(value.id, newName)}
                        />
                        <DialogConfirmation
                            text={"Are you sure you want to set this version as the main one?"}
                            trigger={
                                <button
                                    className={"small-button Table-right-button"}
                                    disabled={value.is_main === 1}>
                                    <i className="far fa-star"/>
                                </button>
                            }
                            afterConfirmation={() => this.setArticleVersionAsMain(value.id)}
                        />
                    </div>
                ),
                width: 50,
                maxWidth: 50,
            },
        ];

		return (
            <div className={"row row-spaced"}>
                <div className="col-md-12">
        			<div className={"row"}>
                        <div className="col-md-12">
                            <h2>Version</h2>
                        </div>
        				<div className="col-md-12">
                            <Table
                                columns={columns}
                                data={this.state.versions}
                                showBottomBar={true}
                                useFlexLayout={true}
                            />
                        </div>
        			</div>
                    <div className={"row"}>
                        <div className="col-md-6">
                            <h2>Add a new version</h2>
                            <FormLine
                                label={"Name"}
                                value={this.state.newVersionName}
                                onChange={v => this.changeState("newVersionName", v)}
                            />
                            <div className="right-buttons">
                                <button
                                    onClick={() => this.addArticleVersion()}
                                    disabled={this.state.newVersionName === null || this.state.newVersionName.length < 2}>
                                    <i className="fas fa-plus"/> Add a new version
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
		);
	}
}