/**
 *  提供消息发送接口
 *      1. 公告发送
 */
//引入module
var pomelo = require('pomelo');
var logger = require('pomelo/node_modules/pomelo-logger').getLogger(pomelo.app.getServerId(), __filename);
var gameConst = require('../../tools/constValue');
var templateManager = require('../../tools/templateManager');
var templateConst = require('../../../template/templateConst');
var defaultValues = require('../../tools/defaultValues');
var tNotice = templateConst.tNotice;
var utils = require('../../tools/utils');
var noticeTMgr = require('../../tools/template/noticeTMgr');
var _ = require('underscore');

//定义noticeManager的this属性
module.exports = function (owner) {
    return new Handler(owner);
};

var Handler = function(owner){
    this.owner = owner;
};

var handler = Handler.prototype;

//公告发送方法
/**发送公告的一般接口
 * @param gmType    公告类型
 * @param compareValue  首次类型公告的比较值
 * @param noticeID  公告ID
 * @param callback
 */
handler.SendGM = function(gmType, compareValue, noticeID, callback){
    var self = this;

    if(!noticeID) return;
    var noticeTemplate = noticeTMgr.GetTemplateByID(noticeID);
    //如果是合法的公告条目， 并且公告冷却时间已过
    if (null != noticeTemplate && self.CheckGMCD(noticeID)) {
        //公告内容
        var roleName = self.owner.playerInfo[gameConst.ePlayerInfo.NAME];
        var beginStr = noticeTemplate[tNotice.noticeBeginStr];
        var endStr = noticeTemplate[tNotice.noticeEndStr];
        var content = beginStr + ' ' + roleName + ' ' + endStr;

        //rpc请求发送公告
        pomelo.app.rpc.chat.chatRemote.SendChat(null, gmType, compareValue, content, callback);
    }
};

/**发送首次类型的公告*/
handler.SendFirstOnlyGM = function(gmType, compareValue, noticeID, callback){
    var self = this;

    if(!callback){
        callback = utils.done;
    }

    self.SendGM(gmType, compareValue, noticeID, callback);
};

/**发送非首次类型公告*/
handler.SendRepeatableGM = function(gmType, noticeID, callback){
    var self = this;

    if(!callback){
        callback = utils.done;
    }

    self.SendGM(gmType, 0, noticeID, callback);
}

//公告判断
/**判断newZhanli是否是新的公告数值， 如果是返回对应的noticeID， 否则返回null
 * @param oldZhanli 老战力
 * @param newZhanli 新战力
 */
handler.GetZhanliValueNoticeID = function(oldZhanli, newZhanli){
    var zhanliValues = noticeTMgr.GetZhanliValues();

    if(!isNaN(oldZhanli) && !isNaN(newZhanli)){
        var oldIndex = _.sortedIndex(zhanliValues, oldZhanli);
        var newIndex = _.sortedIndex(zhanliValues, newZhanli);

        if(newIndex>oldIndex && newIndex>0){
            return "zhanliValue_" + zhanliValues[newIndex-1];
        }
    }
    return null;
};

/**检查cd时间*/
handler.CheckGMCD = function (noticeID){
    return true;
};




