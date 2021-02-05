from resource.account.login import Login
from resource.account.change_password import ChangePassword
from resource.account.forgot_password import ForgotPassword
from resource.account.reset_password import ResetPassword
from resource.article.copy_article_version import CopyArticleVersion
from resource.article.get_articles import GetArticles
from resource.article.get_article import GetArticle
from resource.article.get_article_enums import GetArticleEnums
from resource.article.get_article_tags import GetArticleTags
from resource.article.get_article_versions import GetArticleVersions
from resource.article.get_article_version_content import GetArticleVersionContent
from resource.article.add_article import AddArticle
from resource.article.add_article_version import AddArticleVersion
from resource.article.add_company_tag import AddCompanyTag
from resource.article.add_taxonomy_tag import AddTaxonomyTag
from resource.article.delete_article import DeleteArticle
from resource.article.delete_article_version import DeleteArticleVersion
from resource.article.delete_company_tag import DeleteCompanyTag
from resource.article.delete_taxonomy_tag import DeleteTaxonomyTag
from resource.article.set_article_version_as_main import SetArticleVersionAsMain
from resource.article.update_article import UpdateArticle
from resource.article.update_article_version import UpdateArticleVersion
from resource.article.update_article_version_content import UpdateArticleVersionContent
from resource.address.get_all_addresses import GetAllAddresses
from resource.address.add_address import AddAddress
from resource.address.delete_address import DeleteAddress
from resource.address.update_address import UpdateAddress
from resource.analytic.get_global_analytics import GetGlobalAnalytics
from resource.company.extract_companies import ExtractCompanies
from resource.company.get_companies import GetCompanies
from resource.company.get_company import GetCompany
from resource.company.get_company_addresses import GetCompanyAddresses
from resource.company.get_company_enums import GetCompanyEnums
from resource.company.get_company_taxonomy import GetCompanyTaxonomy
from resource.company.get_company_workforces import GetCompanyWorkforces
from resource.company.update_company import UpdateCompany
from resource.company.add_company import AddCompany
from resource.company.delete_company import DeleteCompany
from resource.log.get_update_article_version_logs import GetUpdateArticleVersionLogs
from resource.mail.get_server_info import GetServerInfo
from resource.mail.get_mail_content import GetMailContent
from resource.mail.save_template import SaveTemplate
from resource.media.add_image import AddImage
from resource.media.get_images import GetImages
from resource.public.get_image import GetImage
from resource.public.get_article_content import GetArticleContent
from resource.public.get_article_rss import GetArticleRSS
from resource.public.get_public_articles import GetPublicArticles
from resource.public.get_related_articles import GetRelatedArticles
from resource.public.get_public_analytics import GetPublicAnalytics
from resource.public.get_public_actors import GetPublicActors
from resource.public.get_public_company import GetPublicCompany
from resource.public.get_public_taxonomy_values import GetPublicTaxonomyValues
from resource.resource.get_resources import GetResources
from resource.source.get_all_sources import GetAllSources
from resource.user.add_user import AddUser
from resource.user.add_user_group import AddUserGroup
from resource.user.add_user_group_right import AddUserGroupRight
from resource.user.delete_user import DeleteUser
from resource.user.delete_user_group import DeleteUserGroup
from resource.user.delete_user_group_right import DeleteUserGroupRight
from resource.user.get_users import GetUsers
from resource.user.get_my_user import GetMyUser
from resource.user.get_user import GetUser
from resource.user.get_user_group_rights import GetUserGroupRights
from resource.user.get_user_groups import GetUserGroups
from resource.user.get_user_group import GetUserGroup
from resource.user.get_user_group_assignments import GetUserGroupAssignments
from resource.user.update_user_group_assignment import UpdateUserGroupAssignment
from resource.taxonomy.add_taxonomy_assignment import AddTaxonomyAssignment
from resource.taxonomy.add_taxonomy_category import AddTaxonomyCategory
from resource.taxonomy.add_taxonomy_category_hierarchy import AddTaxonomyCategoryHierarchy
from resource.taxonomy.add_taxonomy_value import AddTaxonomyValue
from resource.taxonomy.add_taxonomy_value_hierarchy import AddTaxonomyValueHierarchy
from resource.taxonomy.delete_taxonomy_assignment import DeleteTaxonomyAssignment
from resource.taxonomy.delete_taxonomy_category import DeleteTaxonomyCategory
from resource.taxonomy.delete_taxonomy_category_hierarchy import DeleteTaxonomyCategoryHierarchy
from resource.taxonomy.delete_taxonomy_value import DeleteTaxonomyValue
from resource.taxonomy.delete_taxonomy_value_hierarchy import DeleteTaxonomyValueHierarchy
from resource.taxonomy.get_taxonomy_categories import GetTaxonomyCategories
from resource.taxonomy.get_taxonomy_category_hierarchy import GetTaxonomyCategoryHierarchy
from resource.taxonomy.get_taxonomy_values import GetTaxonomyValues
from resource.taxonomy.get_taxonomy_value_hierarchy import GetTaxonomyValueHierarchy
from resource.taxonomy.get_all_taxonomy_value_hierarchy import GetAllTaxonomyValueHierarchy
from resource.workforce.add_workforce import AddWorkforce
from resource.workforce.delete_workforce import DeleteWorkforce


def set_routes(api, db, mail):

    api.add_resource(Login, '/account/login', resource_class_kwargs={"db": db})
    api.add_resource(ChangePassword, '/account/change_password', resource_class_kwargs={"db": db})
    api.add_resource(ForgotPassword, '/account/forgot_password', resource_class_kwargs={"db": db, "mail": mail})
    api.add_resource(ResetPassword, '/account/reset_password', resource_class_kwargs={"db": db})

    api.add_resource(GetAllAddresses, '/address/get_all_addresses', resource_class_kwargs={"db": db})
    api.add_resource(AddAddress, '/address/add_address', resource_class_kwargs={"db": db})
    api.add_resource(DeleteAddress, '/address/delete_address', resource_class_kwargs={"db": db})
    api.add_resource(UpdateAddress, '/address/update_address', resource_class_kwargs={"db": db})

    api.add_resource(CopyArticleVersion, '/article/copy_article_version', resource_class_kwargs={"db": db})
    api.add_resource(GetArticles, '/article/get_articles', resource_class_kwargs={"db": db})
    api.add_resource(GetArticle, '/article/get_article/<id>', resource_class_kwargs={"db": db})
    api.add_resource(GetArticleEnums, '/article/get_article_enums', resource_class_kwargs={"db": db})
    api.add_resource(GetArticleTags, '/article/get_article_tags/<id>', resource_class_kwargs={"db": db})
    api.add_resource(GetArticleVersions, '/article/get_article_versions/<id>', resource_class_kwargs={"db": db})
    api.add_resource(GetArticleVersionContent, '/article/get_article_version_content/<id>', resource_class_kwargs={"db": db})
    api.add_resource(AddArticle, '/article/add_article', resource_class_kwargs={"db": db})
    api.add_resource(AddArticleVersion, '/article/add_article_version', resource_class_kwargs={"db": db})
    api.add_resource(AddCompanyTag, '/article/add_company_tag', resource_class_kwargs={"db": db})
    api.add_resource(AddTaxonomyTag, '/article/add_taxonomy_tag', resource_class_kwargs={"db": db})
    api.add_resource(DeleteArticle, '/article/delete_article', resource_class_kwargs={"db": db})
    api.add_resource(DeleteArticleVersion, '/article/delete_article_version', resource_class_kwargs={"db": db})
    api.add_resource(DeleteCompanyTag, '/article/delete_company_tag', resource_class_kwargs={"db": db})
    api.add_resource(DeleteTaxonomyTag, '/article/delete_taxonomy_tag', resource_class_kwargs={"db": db})
    api.add_resource(SetArticleVersionAsMain, '/article/set_article_version_as_main', resource_class_kwargs={"db": db})
    api.add_resource(UpdateArticle, '/article/update_article', resource_class_kwargs={"db": db})
    api.add_resource(UpdateArticleVersion, '/article/update_article_version', resource_class_kwargs={"db": db})
    api.add_resource(UpdateArticleVersionContent, '/article/update_article_version_content', resource_class_kwargs={"db": db})

    api.add_resource(GetGlobalAnalytics, '/analytic/get_global_analytics', resource_class_kwargs={"db": db})

    api.add_resource(ExtractCompanies, '/company/extract_companies', resource_class_kwargs={"db": db})
    api.add_resource(GetCompanies, '/company/get_companies', resource_class_kwargs={"db": db})
    api.add_resource(GetCompany, '/company/get_company/<id>', resource_class_kwargs={"db": db})
    api.add_resource(GetCompanyAddresses, '/company/get_company_addresses/<id>', resource_class_kwargs={"db": db})
    api.add_resource(GetCompanyEnums, '/company/get_company_enums', resource_class_kwargs={"db": db})
    api.add_resource(GetCompanyTaxonomy, '/company/get_company_taxonomy/<id>', resource_class_kwargs={"db": db})
    api.add_resource(GetCompanyWorkforces, '/company/get_company_workforces/<id>', resource_class_kwargs={"db": db})
    api.add_resource(UpdateCompany, '/company/update_company', resource_class_kwargs={"db": db})
    api.add_resource(AddCompany, '/company/add_company', resource_class_kwargs={"db": db})
    api.add_resource(DeleteCompany, '/company/delete_company', resource_class_kwargs={"db": db})

    api.add_resource(GetUpdateArticleVersionLogs, '/log/get_update_article_version_logs/<id>', resource_class_kwargs={"db": db})

    api.add_resource(GetServerInfo, '/mail/get_server_info', resource_class_kwargs={"db": db})
    api.add_resource(GetMailContent, '/mail/get_mail_content/<name>', resource_class_kwargs={"db": db})
    api.add_resource(SaveTemplate, '/mail/save_template', resource_class_kwargs={"db": db})

    api.add_resource(AddImage, '/media/add_image', resource_class_kwargs={"db": db})
    api.add_resource(GetImages, '/media/get_images', resource_class_kwargs={"db": db})

    api.add_resource(GetArticleContent, '/public/get_article_content/<id>', resource_class_kwargs={"db": db})
    api.add_resource(GetArticleRSS, '/public/get_article_rss', resource_class_kwargs={"db": db})
    api.add_resource(GetPublicAnalytics, '/public/get_public_analytics', resource_class_kwargs={"db": db})
    api.add_resource(GetPublicArticles, '/public/get_public_articles', resource_class_kwargs={"db": db})
    api.add_resource(GetPublicCompany, '/public/get_public_company/<id>', resource_class_kwargs={"db": db})
    api.add_resource(GetImage, '/public/get_image/<id>', resource_class_kwargs={"db": db})
    api.add_resource(GetRelatedArticles, '/public/get_related_articles/<id>', resource_class_kwargs={"db": db})
    api.add_resource(GetPublicTaxonomyValues, '/public/get_public_taxonomy_values', resource_class_kwargs={"db": db})
    api.add_resource(GetPublicActors, '/public/get_public_actors', resource_class_kwargs={"db": db})

    api.add_resource(GetResources, '/resource/get_resources', resource_class_kwargs={"db": db, "api": api})

    api.add_resource(GetAllSources, '/source/get_all_sources', resource_class_kwargs={"db": db})

    api.add_resource(AddUser, '/user/add_user', resource_class_kwargs={"db": db, "mail": mail})
    api.add_resource(AddUserGroup, '/user/add_user_group', resource_class_kwargs={"db": db})
    api.add_resource(AddUserGroupRight, '/user/add_user_group_right', resource_class_kwargs={"db": db})
    api.add_resource(DeleteUser, '/user/delete_user', resource_class_kwargs={"db": db})
    api.add_resource(DeleteUserGroup, '/user/delete_user_group', resource_class_kwargs={"db": db})
    api.add_resource(DeleteUserGroupRight, '/user/delete_user_group_right', resource_class_kwargs={"db": db})
    api.add_resource(GetUsers, '/user/get_users', resource_class_kwargs={"db": db})
    api.add_resource(GetUser, '/user/get_user/<id>', resource_class_kwargs={"db": db})
    api.add_resource(GetUserGroupRights, '/user/get_user_group_rights/<id>', resource_class_kwargs={"db": db})
    api.add_resource(GetUserGroups, '/user/get_user_groups', resource_class_kwargs={"db": db})
    api.add_resource(GetUserGroup, '/user/get_user_group/<id>', resource_class_kwargs={"db": db})
    api.add_resource(GetUserGroupAssignments, '/user/get_user_group_assignments', resource_class_kwargs={"db": db})
    api.add_resource(GetMyUser, '/user/get_my_user', resource_class_kwargs={"db": db})
    api.add_resource(UpdateUserGroupAssignment, '/user/update_user_group_assignment', resource_class_kwargs={"db": db})

    api.add_resource(AddTaxonomyAssignment, '/taxonomy/add_taxonomy_assignment', resource_class_kwargs={"db": db})
    api.add_resource(AddTaxonomyCategory, '/taxonomy/add_taxonomy_category', resource_class_kwargs={"db": db})
    api.add_resource(AddTaxonomyCategoryHierarchy, '/taxonomy/add_taxonomy_category_hierarchy', resource_class_kwargs={"db": db})
    api.add_resource(AddTaxonomyValue, '/taxonomy/add_taxonomy_value', resource_class_kwargs={"db": db})
    api.add_resource(AddTaxonomyValueHierarchy, '/taxonomy/add_taxonomy_value_hierarchy', resource_class_kwargs={"db": db})
    api.add_resource(DeleteTaxonomyAssignment, '/taxonomy/delete_taxonomy_assignment', resource_class_kwargs={"db": db})
    api.add_resource(DeleteTaxonomyCategory, '/taxonomy/delete_taxonomy_category', resource_class_kwargs={"db": db})
    api.add_resource(DeleteTaxonomyCategoryHierarchy, '/taxonomy/delete_taxonomy_category_hierarchy', resource_class_kwargs={"db": db})
    api.add_resource(DeleteTaxonomyValue, '/taxonomy/delete_taxonomy_value', resource_class_kwargs={"db": db})
    api.add_resource(DeleteTaxonomyValueHierarchy, '/taxonomy/delete_taxonomy_value_hierarchy', resource_class_kwargs={"db": db})
    api.add_resource(GetTaxonomyCategories, '/taxonomy/get_taxonomy_categories', resource_class_kwargs={"db": db})
    api.add_resource(GetTaxonomyCategoryHierarchy, '/taxonomy/get_taxonomy_category_hierarchy', resource_class_kwargs={"db": db})
    api.add_resource(GetTaxonomyValues, '/taxonomy/get_taxonomy_values', resource_class_kwargs={"db": db})
    api.add_resource(GetTaxonomyValueHierarchy, '/taxonomy/get_taxonomy_value_hierarchy', resource_class_kwargs={"db": db})
    api.add_resource(GetAllTaxonomyValueHierarchy, '/taxonomy/get_all_taxonomy_value_hierarchy', resource_class_kwargs={"db": db})

    api.add_resource(AddWorkforce, '/workforce/add_workforce', resource_class_kwargs={"db": db})
    api.add_resource(DeleteWorkforce, '/workforce/delete_workforce', resource_class_kwargs={"db": db})
