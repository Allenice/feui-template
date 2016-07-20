###*
# entry helper 
# @date 2016-06-27 10:21:19
# @author Allenice <994298628@qq.com>
# @link http://www.allenice233.com
###

'use strict'

fs = require 'fs'
path = require 'path'

module.exports =
    ###*
     * 获取入口文件
     * @param  {String} entryPath 入口文件夹的绝对路径
     * @return {Object}           {entryName1: entryPath1 ...}
    ###
    getEntries: (entryPath)->
        entries = {}
        try
            data = fs.readdirSync entryPath
            data.forEach (filename)->
                entries[path.basename(filename, '.coffee')] = path.join entryPath, filename

            return entries
        catch e
            console.log e
        
       