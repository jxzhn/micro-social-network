<%@ page language="java" contentType="application/json" pageEncoding="UTF-8"%>
<%@ page import="java.util.*, java.io.*" %>
<%@ page import="org.json.*" %>
<%@ page import="java.sql.*" %>

<%!
String getPostData(InputStream in, int size, String charset) {
    if (in != null && size > 0) {
        byte[] buf = new byte[size];
        try{
            in.read(buf);
            if  (charset == null || charset.length() == 0) {
                return new String(buf);
            } else {
                return new String(buf,charset);
            }
        } catch (IOException e){
            e.printStackTrace();
        }
    }
    return null;
}
%>

<%
String msg = "";
int code = 0;
if (request.getMethod().equalsIgnoreCase("post")) {
    //获得请求体
    String postbody = getPostData(request.getInputStream(), request.getContentLength(), null);
    JSONObject postData = new JSONObject(postbody);

    int itimeStamp = (int)postData.get("timeStamp");
    long timeStamp = Long.valueOf(itimeStamp);
    int loadedNum = (int)postData.get("loadedNum");
    int requestNum = (int)postData.get("requestNum");
    String currentUserId = (String)session.getAttribute("id");

    //连接数据库
    String connectString = "jdbc:mysql://localhost:3306/wwb?autoReconnect=true" + 
        "&useUnicode=true&characterEncoding=UTF-8";
    //String connectString = "jdbc:mysql://localhost:3306/wwb?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8";
    List<JSONObject> jsonArray = new ArrayList<>();
    try {
        Class.forName("com.mysql.jdbc.Driver");
        //Class.forName("com.mysql.cj.jdbc.Driver");
        Connection conn = DriverManager.getConnection(connectString, "root", "root");
        PreparedStatement stmt = conn.prepareStatement("select * from users where ID like ?");
        stmt.setString(1, currentUserId);
        
        //判断用户是否存在
        ResultSet rs = stmt.executeQuery();
        if (!rs.next()) {
            code = 1001;
            msg = "The user does not exist！";
        } else {

            stmt = conn.prepareStatement("select * from Followers where userId=?");
            stmt.setString(1, currentUserId);
        
            rs = stmt.executeQuery();
            if (!rs.next()) {
                msg = "the following list is empty!";
            } else {
                rs.last(); //结果集指针知道最后一行数据
                int n = rs.getRow();
                rs.beforeFirst();//将结果集指针指回到开始位置，这样才能通过while获取rs中的数据


                if (n <= 0) {
                    code = 0;
                    msg = "no one post new postings!";
                } else {

                    String sql = "select * from postings where userId=?";
                    for (int i = 1; i < n; i++) {
                        sql += " or userId=?";
                    }
                    sql += " and createTime<? order by createTime limit ? offset ?";

                    stmt = conn.prepareStatement(sql, ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_UPDATABLE);
                    int index = 1;
                    while (rs.next()) {
                        String fuserId = rs.getString("userFollowedId");
                        stmt.setString(index,fuserId);
                        index++;
                    }
                    stmt.setLong(index,timeStamp);
                    stmt.setInt(index+1,requestNum);
                    stmt.setInt(index+2,loadedNum);

                    rs = stmt.executeQuery();

                    while(rs.next()) {
                        String userId = rs.getString("userId");
                        String postId = rs.getString("ID");
                        long date = rs.getLong("createTime");
                        String content = rs.getString("contents");
                        String imgUrl = rs.getString("image");
                        int numComment = rs.getInt("comments");
                        int numLike = rs.getInt("likes");

                        //查询是否点赞------------------------------------
                        stmt = conn.prepareStatement("select * from likes where userId=? and postId=?");
                        stmt.setString(1,currentUserId);
                        stmt.setString(2,postId);

                        ResultSet likeExist = stmt.executeQuery();
                        boolean liked = false;
                        if (likeExist.next()) {
                            liked = true;
                        }
                        //-----------------------------------------------
                        //查询发帖用户个人信息
                        stmt = conn.prepareStatement("select * from users where ID=?");
                        stmt.setString(1,userId);

                        ResultSet userInfo = stmt.executeQuery();
                        String userName = "";
                        String userImgUrl = "";
                        if (userInfo.next()) {
                            userName = userInfo.getString("name");
                            userImgUrl = userInfo.getString("avatar");
                        } else {
                            code = -1;
                            msg = "fail to get the postings info";
                        }

                        JSONObject user = new JSONObject();
                        user.put("userName",userName);
                        user.put("userId",userId);
                        user.put("userImgUrl",userImgUrl);

                        JSONObject post = new JSONObject();
                        post.put("user",user);
                        post.put("postId",postId);
                        post.put("date",date);
                        post.put("content",content);
                        post.put("imgUrl",imgUrl);
                        post.put("numComment",numComment);
                        post.put("liked",liked);
                        post.put("numLike",numLike);

                        jsonArray.add(post); 
                    }
                }

            }
        }
        
        rs.close();
        stmt.close();
        conn.close();
    } catch (Exception e) {
        code = -1;
        msg = e.getMessage();
    }

    JSONObject retval = new JSONObject();
    retval.put("code",code);
    retval.put("msg",msg);
    JSONObject data = new JSONObject();
    data.put("posts",jsonArray);
    retval.put("data",data);
    out.print(retval.toString());
}

%>