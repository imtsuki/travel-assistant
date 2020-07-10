#!/bin/sh
notedown --match=strict COVID-19疫情环境下低风险旅行模拟系统的设计.md > COVID-19疫情环境下低风险旅行模拟系统的设计.ipynb
jupyter nbconvert COVID-19疫情环境下低风险旅行模拟系统的设计.ipynb --to latex --template report
xelatex COVID-19疫情环境下低风险旅行模拟系统的设计.tex
