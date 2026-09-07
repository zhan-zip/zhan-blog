---
title: 11-leetcode第[4]期-长度最小的子数组
published: 2026-09-07
description: 无
category: leetcode
tags: [力扣, 算法]
---

# 本期话题——长度最小的子数组

今天讲数组部分的长度最小的子数组，关于数组的基础知识可以看代码随想录的这里->[数组理论基础](https://programmercarl.com/algo/array/array-basics.html)

这期从基础的暴力解法讲到滑动窗口法。

阅前注意：

* 此系列以代码随想录为基础，仅是记录个人认为需要补充的部分。

* 此篇内容仅供学习参考。

* 个人编写，有不同的观点欢迎交流。

***

今天没有前言，直接看题目。

# 题目

给定一个含有 `n`个正整数的数组和一个正整数 `target` **。**

找出该数组中满足其总和大于等于`target`的长度最小的 **子数组** `[numsl, numsl+1, ..., numsr-1, numsr]`，并返回其长度。不存在符合条件的子数组，返回`0` 。

**示例 1：**

```
输入：target = 7, nums = [2,3,1,2,4,3]
输出：2
解释：子数组 [4,3] 是该条件下的长度最小的子数组。

```

**示例 2：**

```
输入：target = 4, nums = [1,4,4]
输出：1

```

**示例 3：**

```
输入：target = 11, nums = [1,1,1,1,1,1,1,1]
输出：0
```

***

# 分析题目

我们打开力扣，可以看到这题给出的开头是这样的（java版）——

```
class Solution {
    public int minSubArrayLen(int target, int[] nums) {
        
    }
}
```

依旧是不管什么语言，总之开头我们拿到了一个int类型的`数组nums`，以及一个`目标值target`。

我们想从nums中找一个元素和为目标值，同时数组长度最小的子数组，那我们必然需要一个`int`类型的数来计算和存放`子数组的长度`，接下来我们称为`result`。为了保证它能慢慢缩小直到找到那个最小长度，我们需要将其设为该类型的最大值，之后再更新。

同时，为了计算当前`子数组的元素和`，我们还需要一个`int`类型的值，称为`sum`，初始值设为0。

而为了求得子数组，我们就需要`左右两个边界值`来规定`子数组的位置`。

最简单最直观的方法也很明显，直接**暴力遍历求解**，例如这个例子。

用两层遍历，`i`作为`左边界`，`j`作为`右边界`。

让`i`从0开始`遍历`到数组nums的`最后一个元素`。

同时对于每一个i，让j作为右边界，从`当前i的位置`开始，给`sum加上当前的元素值`，并`比较`当前sum是否达到了目标值target——如果达到就`更新`result，否则直接`返回`，进入下一个i的遍历，将`sum归零`后继续从这个i开始找。

示例代码如下。

```
class Solution {
    public int minSubArrayLen(int target, int[] nums) {
        int n = nums.length;
        int result = Integer.MAX_VALUE;
        for (int i = 0; i < n; i++) {
            int sum = 0; 
            for (int j = i; j < n; j++) {
                sum += nums[j]; 
                if (sum >= target) {
                    result = Math.min(result, j - i + 1);
                    break;
                }
            }
        }
        return result == Integer.MAX_VALUE ? 0 : result;
    }
}
```

这个解法非常直观，但是……

力扣更新了，这题暴力解法会超时。所以我们不得不进入优化环节。

***

# 解题

### 滑动窗口法

刚刚的暴力解法里，我们用了i和j分别作为左右边界，但它们分别散落在`各自的for循环`里，这样就使得时间复杂度比一个for循环要高得多。那有没有什么办法能让左右边界挤到一个for循环里？

假如我们`将其中一个边界固定`，假设右边界是固定的，那么在这个情况下，我们需要`左边界`进行`更新`，从而实现更新子数组的效果。

暴力解法里，我们使用for循环来进行更新，但显然是超时的。

那换个思路，`左边界初始值为0`时，我们每次执行完`计算当前子数组元素和`后，就将`左边界值+1`，让其移动，也可以实现更新子数组。

但这个时候`子数组元素和`怎么计算呢？毕竟我们可不确定右边界现在在哪，难道又用遍历从左边界到右边界加一遍吗？

依旧换个思路，我们不用加的，用`减`的。

先计算出`从0到右边界中间这个数组的所有元素和`，接着在移动左边界时，`减去`左边界所在的元素。

好了，现在我们知道了固定右边界的情况下，不使用for循环，怎么更新左边界和计算子数组元素和。

那么我们就可以看看怎么更新右边界了——既然左边界已经优化过了，我们右边界直接用`for循环`即可，不会再超时了。

所以`计算从0到右边界中间这个数组的所有元素和`就可以直接在右边界的`for循环开头`进行`+当前右边界所在元素`来实现。

简单来说，我们将暴力解法中的左右边界的其中一个的for循环，优化为`特定情况下`（sum不小于目标值target）使用`while循环`的方式，从而降低时间复杂度。

java版的代码如下——

```
class Solution {
    public int minSubArrayLen(int target, int[] nums) {
        int left = 0;
        int sum = 0;
        int result = Integer.MAX_VALUE;
        for(int right = 0;right < nums.length;right ++) {
            sum += nums[right];
            while(sum >= target) {
                result = Math.min(result, right - left + 1);
                sum -= nums[left];
                left ++;
            }
        }
        return result == Integer.MAX_VALUE ? 0 : result;
    }
}
```

***

# 结语

那么本期长度最小的子数组的内容就讲到这里啦，力扣链接附在这里[209. 长度最小的子数组](https://leetcode.cn/problems/minimum-size-subarray-sum/description/)，我们下期再见^q^
