.DEFAULT_GOAL := main.pdf

main.pdf: main.tex jishoScrape/index.js title/titlepage.tex $(wildcard data/pages/*) $(wildcard data/tables/*)
	for i in $$(seq 7); do node jishoScrape/index.js grade$$i; done
	xelatex main.tex

#TODO: Make this modular, fix the index.js target.

jishoScrape/index.js: $(wildcard jishoScrape/src/*.js)

# data/pages/n%.tex:  data/txt/n%.txt jishoScrape/index.js
# 	node jishoScrape/index.js n%

# data/tables/n%.tex:  data/txt/n%.txt jishoScrape/index.js
# 	node jishoScrape/index.js n%

.PHONY: clean main.pdf folders
clean:
	rm data/pages/*
	rm data/tables/*
	rm main.aux main.log main.out main.toc main.synctex.gz

folders:
	mkdir data/pages
	mkdir data/tables
	mkdir data/testing
	mkdir data/jisho
	cd jishoScrape
	npm install
	cd ..
